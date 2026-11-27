// Service Worker: hält die App-Dateien offline verfügbar.
// Nach Änderungen an Dateien VERSION erhöhen, damit Handys das Update laden.
const VERSION = "v30";
const CACHE = "friendlender-" + VERSION;
const DATEIEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/calendar.js",
  "./js/storage.js",
  "./js/config.js",
  "./js/designs.js",
  "./js/icons.js",
  "./js/szenen.js",
  "./img/scuba-cat.webp",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Eigene Dateien: zuerst Netzwerk (immer aktuell), sonst Cache (offline).
// Fremde Anfragen (Supabase, Schriften, CDN) werden nicht angefasst.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});

// ---------- Push-Benachrichtigungen ----------
// Kommen von der Vercel-Funktion /api/push (Einladung erhalten, Einladung angenommen).
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { text: e.data && e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(d.titel || "Friendlender", {
      body: d.text || "",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: d.tag,
      renotify: !!d.tag,
      data: { url: d.url || "./" },
    })
  );
});

// Tippen auf die Benachrichtigung öffnet die App (oder holt sie nach vorne)
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const ziel = new URL(e.notification.data?.url || "./", self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenster) => {
      for (const f of fenster) {
        if (f.url.startsWith(self.registration.scope) && "focus" in f) return f.focus();
      }
      return self.clients.openWindow(ziel);
    })
  );
});
