/* 離線也能開：頁面優先走網路（有更新會自動換新），沒網路就用快取 */
const V='jj-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='jj-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(V).then(c=>c.put(r,copy));}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  }else if(/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open('jj-fonts').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res;}))));
  }
});
