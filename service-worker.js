/**
 * service-worker.js
 * Cache básico "app shell" para permitir uso offline do Evolution Eventos.
 */

const CACHE_NOME = 'evolution-eventos-v5';

const ARQUIVOS_APP_SHELL = [
  './index.html',
  './admin.html',
  './manifest.json',
  './style/variables.css',
  './style/components.css',
  './style/animations.css',
  './style/style.css',
  './style/intro.css',
  './scripts/app.js',
  './scripts/intro.js',
  './scripts/tema-junino.js',
  './scripts/integracoes.js',
  './scripts/admin.js',
  './scripts/database.js',
  './scripts/event.js',
  './scripts/storage.js',
  './scripts/ui.js',
  './utils/helpers.js',
  './utils/modal.js',
  './utils/toast.js',
  './data/events.json',
  './data/items.json',
  './data/participants.json',
  './assets/logo/logo.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/icons/icon-maskable.svg',
  './assets/images/evento-capa.svg',
  './assets/images/arraia-personagem.jpg',
  './assets/audio/tema-junino.mp3',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) =>
      Promise.allSettled(ARQUIVOS_APP_SHELL.map((arquivo) => cache.add(arquivo)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((c) => c !== CACHE_NOME).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;

      return fetch(evento.request)
        .then((respostaRede) => {
          const clone = respostaRede.clone();
          caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, clone));
          return respostaRede;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
