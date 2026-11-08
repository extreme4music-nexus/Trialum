/* Optional PWA offline support. Does not fake background notification scheduling. */
const CACHE='trialum-1-2-v1';
const FILES=['./','index.html','assets/style.css','assets/icon.svg','manifest.webmanifest','vendor/zzfx.min.js','js/engine.js','js/evolution.js','js/peer.js','js/storage.js','js/audio.js','js/world.js','js/app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
