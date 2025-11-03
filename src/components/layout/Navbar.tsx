'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Ticket } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      height: '50px', 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: '40px',
      paddingRight: '40px',
      gap: '12px',
      zIndex: 50
    }}>
      
      {/* Logo en la izquierda */}
      <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/images/logo.png" alt="DanZar Logo" style={{ height: '35px', width: 'auto' }} />
        </Link>
      </div>

      {/* Navegación principal */}
      <Link href="/eventos">
        <button style={{
          backgroundColor: 'transparent',
          color: '#9333ea',
          padding: '8px 16px',
          border: '1px solid #9333ea',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.backgroundColor = '#9333ea';
          (e.target as HTMLElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
          (e.target as HTMLElement).style.color = '#9333ea';
        }}>
          <Ticket size={16} />
          Eventos
        </button>
      </Link>

      <Link href="/mi-ticket">
        <button style={{
          backgroundColor: 'transparent',
          color: '#3b82f6',
          padding: '8px 16px',
          border: '1px solid #3b82f6',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.backgroundColor = '#3b82f6';
          (e.target as HTMLElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
          (e.target as HTMLElement).style.color = '#3b82f6';
        }}>
          <Ticket size={16} />
          Mi Ticket
        </button>
      </Link>

      {/* Usuario logueado o botones de auth */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {user ? (
          <>
            {/* Información del usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0'
                }}>
                  {user.name || user.email}
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {user.role === 'student' ? 'Estudiante' : 
                   user.role === 'instructor' ? 'Instructor' :
                   user.role === 'admin' ? 'Administrador' :
                   user.role === 'developer' ? 'Desarrollador' : user.role}
                </p>
              </div>
              
              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Botón Dashboard */}
            <Link href="/dashboard">
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#3b82f6';
              }}>
                Dashboard
              </button>
            </Link>

            {/* Botón Admin (visible para todos los usuarios logueados) */}
            <Link href="/admin/pin">
              <button style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#6b7280';
              }}>
                <Shield size={16} style={{ marginRight: '4px' }} />
                Admin
              </button>
            </Link>

            {/* Botón Cerrar Sesión */}
            <button 
              onClick={handleSignOut}
              style={{
                backgroundColor: 'transparent',
                color: '#ef4444',
                padding: '8px 16px',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#ef4444';
                (e.target as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                (e.target as HTMLElement).style.color = '#ef4444';
              }}>
              Salir
            </button>
          </>
        ) : (
          <>
            {/* Botones para usuarios no logueados */}
            <Link href="/auth/login">
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#2563eb';
                (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                (e.target as HTMLElement).style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#3b82f6';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
              }}>
                Iniciar Sesión
              </button>
            </Link>
            
            <Link href="/auth/register">
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#3b82f6';
              }}>
                Regístrate
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
