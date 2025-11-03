'use client';

import React, { useEffect, useState } from 'react';

interface QRCodeWrapperProps {
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

export default function QRCodeWrapper(props: QRCodeWrapperProps) {
  const [QRCodeComponent, setQRCodeComponent] = useState<React.ComponentType<QRCodeWrapperProps> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMounted(true);
    let mounted = true;

    import('qrcode.react')
      .then((module) => {
        if (!mounted) return;
        const QRCode = module.QRCodeSVG;
        if (QRCode) {
          setQRCodeComponent(QRCode);
        }
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('Error cargando QRCodeSVG:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isMounted || !QRCodeComponent) {
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

  return <QRCodeComponent {...props} />;
}

