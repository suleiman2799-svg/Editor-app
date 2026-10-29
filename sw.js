const V='whiteout-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const CDN=[
'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Manrope:wght@500;700;800&display=swap'
];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await c.addAll(CORE);
    await Promise.all(CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!r.url.startsWith('http'))return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(same){
      try{const n=await fetch(r);if(n.ok)c.put(r,n.clone());return n}
      catch(_){return (await c.match(r,{ignoreSearch:true}))||(await c.match('./index.html'))}
    }
    const hit=await c.match(r);
    if(hit)return hit;
    try{const n=await fetch(r);if(n.ok||n.type==='opaque')c.put(r,n.clone());return n}
    catch(_){return Response.error()}
  })());
});
