'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo verificar permisos si no estamos en las páginas de login, setup, check-role o pin
    if (!loading && !window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/setup') && !window.location.pathname.includes('/admin/check-role') && !window.location.pathname.includes('/admin/pin')) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'developer') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router]);

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
  if (!window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/setup') && !window.location.pathname.includes('/admin/check-role') && !window.location.pathname.includes('/admin/pin')) {
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
