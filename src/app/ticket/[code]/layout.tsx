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
      if (window.innerWidth <= 768) {
        const nav = document.querySelector('nav');
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        const main = document.querySelector('main');
        
        if (nav) nav.style.display = 'none';
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (main) main.style.paddingTop = '0';
      }
    };

    hideElements();
    window.addEventListener('resize', hideElements);
    
    return () => {
      window.removeEventListener('resize', hideElements);
    };
  }, []);

  return <>{children}</>;
}
