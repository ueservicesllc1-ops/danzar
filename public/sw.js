// Service Worker para DanZar - Permite acceso offline a la página de tickets
const CACHE_NAME = 'danzar-tickets-v2';
const STATIC_CACHE_NAME = 'danzar-static-v2';

// Verificar si estamos en desarrollo y auto-desregistrarse
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  // Auto-desregistrarse en desarrollo
  self.registration?.unregister().catch(() => {});
  // NO interceptar NADA en desarrollo - dejar pasar todas las peticiones
  self.addEventListener('fetch', (event) => {
    // NO interceptar nada en desarrollo - dejar que el navegador maneje todo
    event.respondWith(fetch(event.request));
    return;
  });
} else {
  // Instalación del Service Worker (solo en producción)
  self.addEventListener('install', (event) => {
    event.waitUntil(
      Promise.all([
        caches.open(STATIC_CACHE_NAME).then((cache) => {
          return cache.addAll([
            '/',
            '/mi-ticket',
            '/images/logo.png',
            '/images/banner.jpg',
          ]);
        }),
        self.skipWaiting() // Activar inmediatamente
      ])
    );
  });
}

// Cachear páginas de tickets dinámicas cuando se visitan (solo en producción)
if (self.location.hostname !== 'localhost' && self.location.hostname !== '127.0.0.1') {
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_TICKET_PAGE') {
      const url = event.data.url;
      caches.open(CACHE_NAME).then((cache) => {
        fetch(url).then((response) => {
          if (response.status === 200) {
            cache.put(url, response);
          }
        });
      });
    }
  });

  // Activación del Service Worker
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      Promise.all([
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                console.log('Service Worker: Eliminando cache antiguo', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }),
        self.clients.claim() // Tomar control inmediatamente
      ])
    );
  });
}

// Estrategia: Network First con fallback a Cache para páginas, Cache First para recursos estáticos
// SOLO en producción (no en localhost)
if (self.location.hostname !== 'localhost' && self.location.hostname !== '127.0.0.1') {
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // EXCLUIR COMPLETAMENTE recursos de Next.js, APIs, recursos externos, y cualquier cosa relacionada con desarrollo
    // Esta es la PRIMERA verificación y debe ser muy estricta
    if (url.pathname.startsWith('/_next/') || 
        url.pathname.startsWith('/_webpack/') ||
        url.pathname.includes('/api/') ||
        url.pathname.includes('/webpack') ||
        url.pathname.includes('.css') ||
        url.pathname.includes('.js') ||
        url.pathname.includes('.map') ||
        url.pathname.includes('webpack') ||
        url.hostname !== location.hostname ||
        request.method !== 'GET') {
      // NO interceptar estas peticiones - dejar que el navegador las maneje normalmente
      return;
    }

    // Solo interceptar páginas HTML específicas (tickets)
    if (request.destination === 'document' && 
        (url.pathname.includes('/ticket/') || url.pathname === '/mi-ticket')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Si la respuesta es exitosa, cachearla y retornarla
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache).catch(() => {
                  // Ignorar errores de cache silenciosamente
                });
              }).catch(() => {
                // Ignorar errores de cache silenciosamente
              });
            }
            return response;
          })
          .catch((error) => {
            // Si falla la red, intentar servir desde cache
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback a página de búsqueda si no hay en cache
              return caches.match('/mi-ticket').catch(() => {
                // Si todo falla, devolver la petición original al navegador
                return fetch(request);
              });
            }).catch(() => {
              // Si todo falla, devolver la petición original al navegador
              return fetch(request);
            });
          })
      );
    }
    // Para imágenes del proyecto específicas, usar Cache First
    else if (request.destination === 'image' && 
             url.pathname.startsWith('/images/') &&
             (url.pathname.includes('logo.png') || url.pathname.includes('banner.jpg'))) {
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(STATIC_CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache).catch(() => {
                      // Ignorar errores de cache silenciosamente
                    });
                  }).catch(() => {
                    // Ignorar errores de cache silenciosamente
                  });
                }
                return response;
              })
              .catch((error) => {
                // Si falla el fetch, devolver la petición original
                return fetch(request);
              });
          })
          .catch(() => {
            // Si falla el cache, devolver la petición original
            return fetch(request);
          })
      );
    }
    // Para todas las demás peticiones, NO interceptar - dejar que el navegador las maneje
  });
}

