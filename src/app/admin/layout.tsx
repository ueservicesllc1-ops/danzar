'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo verificar permisos si no estamos en las páginas de login, setup, check-role o pin
    if (!loading && !pathname.includes('/admin/login') && !pathname.includes('/admin/setup') && !pathname.includes('/admin/check-role') && !pathname.includes('/admin/pin')) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'developer') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar contenido protegido si no estamos en login, setup, check-role o pin
  if (!pathname.includes('/admin/login') && !pathname.includes('/admin/setup') && !pathname.includes('/admin/check-role') && !pathname.includes('/admin/pin')) {
    if (!user || (user.role !== 'admin' && user.role !== 'developer')) {
      return null;
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingTop: '120px'
    }}>
      {children}
    </div>
  );
}
