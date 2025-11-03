'use client';

import React, { useEffect, useState, ComponentType } from 'react';

interface SafeQRCodeProps {
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

export default function SafeQRCode(props: SafeQRCodeProps) {
  const [QRCodeComponent, setQRCodeComponent] = useState<ComponentType<SafeQRCodeProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    import('qrcode.react')
      .then((module) => {
        if (!mounted) return;
        
        const QRCode = module.QRCodeSVG;
        if (QRCode) {
          setQRCodeComponent(() => QRCode);
        } else {
          setError('QRCodeSVG no encontrado en el módulo');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error cargando qrcode.react:', err);
        setError('Error al cargar el componente QR');
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div 
        className={props.className}
        style={{ 
          width: props.size || 200, 
          height: props.size || 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px'
        }}
      >
        <div style={{ color: '#dc2626', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!QRCodeComponent) {
    return (
      <div 
        className={props.className}
        style={{ 
          width: props.size || 200, 
          height: props.size || 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}
      >
        <div style={{ color: '#9ca3af', fontSize: '14px' }}>Cargando QR...</div>
      </div>
    );
  }

  const QRCode = QRCodeComponent;
  return <QRCode {...props} />;
}

