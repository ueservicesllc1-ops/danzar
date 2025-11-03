'use client';

import React, { useState, useEffect } from 'react';

interface MobileQRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  className?: string;
}

export default function MobileQRCode(props: MobileQRCodeProps) {
  const [QRCodeComponent, setQRCodeComponent] = useState<React.ComponentType<{ value: string; size: number; level?: string; includeMargin?: boolean; imageSettings?: unknown; bgColor?: string; }> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window === 'undefined') return;

    let mounted = true;

    import('qrcode.react')
      .then((module) => {
        if (!mounted) return;
        // Verificar que el módulo tenga QRCodeSVG
        if (module && module.QRCodeSVG) {
          setQRCodeComponent(module.QRCodeSVG as React.ComponentType<{ value: string; size: number; level?: string; includeMargin?: boolean; imageSettings?: unknown; bgColor?: string; className?: string; }>);
        } else {
          console.error('QRCodeSVG no encontrado en el módulo qrcode.react');
          setError('No se pudo cargar el generador de QR');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error cargando qrcode.react:', err);
        setError('Error al cargar el generador de QR');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const size = props.size || 200;

  // Mostrar placeholder mientras carga o si hay error
  if (!isMounted || !QRCodeComponent || error) {
    return (
      <div 
        className={props.className}
        style={{ 
          width: size, 
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px'
        }}
      >
        <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>
          {error || 'Cargando QR...'}
        </div>
      </div>
    );
  }

  // Renderizar el componente QRCode usando JSX directamente
  const QRCode = QRCodeComponent;
  return (
    <div style={{ backgroundColor: 'transparent', display: 'inline-block' }}>
      <QRCode 
        value={props.value}
        size={props.size || 200}
        level={props.level}
        includeMargin={props.includeMargin}
        imageSettings={props.imageSettings}
        bgColor="transparent"
      />
    </div>
  );
}

