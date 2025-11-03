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
      
      const isMobile = window.innerWidth <= 768;
      const main = document.querySelector('main');
      
      // Buscar el Navbar usando el layout principal
      // El Navbar está en un div con position fixed, top 0, height 50px
      const navbarDiv = Array.from(document.querySelectorAll('div')).find(div => {
        const computedStyle = window.getComputedStyle(div);
        const inlineStyle = div.getAttribute('style') || '';
        return (computedStyle.position === 'fixed' || inlineStyle.includes('position: fixed')) &&
               (computedStyle.top === '0px' || inlineStyle.includes('top: 0')) &&
               (computedStyle.height === '50px' || inlineStyle.includes('height: \'50px\''));
      }) as HTMLElement | undefined;
      
      // Buscar Footer - está en el layout principal
      const footerDiv = Array.from(document.querySelectorAll('div')).find(div => {
        const computedStyle = window.getComputedStyle(div);
        const inlineStyle = div.getAttribute('style') || '';
        return (computedStyle.backgroundColor === 'rgb(248, 250, 252)' ||
                inlineStyle.includes('backgroundColor: \'#f8fafc\'') ||
                inlineStyle.includes('background-color: #f8fafc'));
      }) as HTMLElement | undefined;
      
      if (isMobile) {
        // Ocultar en móvil
        if (navbarDiv) {
          navbarDiv.style.cssText += 'display: none !important;';
        }
        if (footerDiv) {
          footerDiv.style.cssText += 'display: none !important;';
        }
        if (main) {
          main.style.cssText += 'padding-top: 0 !important; margin-top: 0 !important;';
        }
      } else {
        // Restaurar en desktop
        if (navbarDiv) {
          navbarDiv.style.cssText = navbarDiv.style.cssText.replace(/display:\s*none\s*!important;?/gi, '');
        }
        if (footerDiv) {
          footerDiv.style.cssText = footerDiv.style.cssText.replace(/display:\s*none\s*!important;?/gi, '');
        }
        if (main) {
          main.style.cssText = main.style.cssText.replace(/padding-top:\s*0\s*!important;?/gi, '');
          main.style.cssText = main.style.cssText.replace(/margin-top:\s*0\s*!important;?/gi, '');
        }
      }
    };

    // Ejecutar múltiples veces para asegurar que se oculte
    hideElements();
    const timer1 = setTimeout(hideElements, 0);
    const timer2 = setTimeout(hideElements, 50);
    const timer3 = setTimeout(hideElements, 100);
    const timer4 = setTimeout(hideElements, 200);
    
    window.addEventListener('resize', hideElements);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('resize', hideElements);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            main > div[style*="position: fixed"][style*="top: 0"] {
              display: none !important;
            }
            main {
              padding-top: 0 !important;
              margin-top: 0 !important;
            }
          }
        `
      }} />
      {children}
    </>
  );
}
