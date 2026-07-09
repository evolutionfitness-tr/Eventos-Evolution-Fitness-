/**
 * service-worker.js
 * Cache básico "app shell" para permitir uso offline do Evolution Eventos.
 */

const CACHE_NOME = 'evolution-eventos-v2';

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
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_APP_SHELL)).catch(() => {
      /* Se algum arquivo falhar (ex.: imagem ainda não enviada), instala o resto mesmo assim. */
    })
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
