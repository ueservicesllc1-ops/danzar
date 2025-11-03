'use client';

import { useEffect } from 'react';

export default function TicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ocultar Navbar y Footer en móvil para pantalla completa
    const hideElements = () => {
      if (typeof window === 'undefined') return;
      
      const nav = document.querySelector('nav');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const main = document.querySelector('main');
      
      // Siempre ocultar en móvil (pantalla <= 768px)
      if (window.innerWidth <= 768) {
        if (nav) {
          nav.style.display = 'none';
          nav.style.setProperty('display', 'none', 'important');
        }
        if (header) {
          header.style.display = 'none';
          header.style.setProperty('display', 'none', 'important');
        }
        if (footer) {
          footer.style.display = 'none';
          footer.style.setProperty('display', 'none', 'important');
        }
        if (main) {
          main.style.paddingTop = '0';
          main.style.setProperty('padding-top', '0', 'important');
          main.style.setProperty('margin-top', '0', 'important');
        }
      } else {
        // Restaurar en desktop
        if (nav) nav.style.display = '';
        if (header) header.style.display = '';
        if (footer) footer.style.display = '';
        if (main) {
          main.style.paddingTop = '';
          main.style.marginTop = '';
        }
      }
    };

    // Ejecutar inmediatamente y después de un pequeño delay para asegurar que el DOM esté listo
    hideElements();
    setTimeout(hideElements, 0);
    setTimeout(hideElements, 100);
    
    window.addEventListener('resize', hideElements);
    
    return () => {
      window.removeEventListener('resize', hideElements);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          nav,
          header,
          footer {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
