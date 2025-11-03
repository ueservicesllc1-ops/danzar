'use client';

import { useEffect, useRef } from 'react';

export default function ServiceWorkerRegistration() {
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // NO registrar service worker en desarrollo/localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Desregistrar TODOS los service workers existentes en desarrollo de forma agresiva
      if ('serviceWorker' in navigator) {
        const unregisterAll = async () => {
          try {
            // Obtener todas las registraciones
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            // Desregistrar todas las registraciones
            const unregisterPromises = registrations.map((registration) => {
              return registration.unregister().catch((error) => {
                // Ignorar errores silenciosamente
                return null;
              });
            });
            
            await Promise.all(unregisterPromises);
            
            // También limpiar los caches si existen
            if ('caches' in window) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(
                  cacheNames.map((cacheName) => caches.delete(cacheName))
                );
              } catch (error) {
                // Ignorar errores de cache
              }
            }
          } catch (error) {
            // Ignorar errores silenciosamente
          }
        };
        
        // Ejecutar inmediatamente y también después de un delay
        unregisterAll();
        setTimeout(unregisterAll, 100);
        setTimeout(unregisterAll, 1000);
      }
      
      // NO hacer nada más en desarrollo
      return;
    }
    
    // Solo en producción: registrar el service worker
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Desregistrar cualquier service worker existente primero
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          }).catch((error) => {
            console.log('Service Worker no disponible:', error?.message || error);
            return null;
          });

          if (registration) {
            console.log('Service Worker registrado exitosamente:', registration.scope);
            
            updateIntervalRef.current = setInterval(() => {
              if (registration) {
                registration.update().catch(() => {
                  // Silenciar errores de actualización
                });
              }
            }, 60000);
          }
        } catch (error) {
          console.log('Service Worker no disponible:', error);
        }
      };

      const timeout = setTimeout(registerSW, 1000);
      
      return () => {
        clearTimeout(timeout);
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }
  }, []);

  return null;
}

