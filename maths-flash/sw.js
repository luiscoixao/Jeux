const CACHE='maths-flash-bac-v3';
const FILES=['./','./index.html','./style.css?v=3','./questions.js','./app.js?v=3','./manifest.json?v=3','./icon.svg?v=3','./icon-pi-180.png','./icon-pi-192.png','./icon-pi-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('maths-flash-bac-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r|| (e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});
