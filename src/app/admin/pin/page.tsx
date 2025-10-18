'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPinPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular verificación (pequeña demora para UX)
    setTimeout(() => {
      if (pin === '1619') {
        // PIN correcto - redirigir al panel de admin
        router.push('/admin');
      } else {
        setError('PIN incorrecto. Intenta nuevamente.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      paddingTop: '40px',
      paddingBottom: '40px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '2px solid #ef4444'
      }}>
        
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🔐
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Acceso Administrativo
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280'
          }}>
            Ingresa el PIN para acceder al panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              PIN de Acceso
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              placeholder="Ingresa el PIN"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '2px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#ef4444';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
              }}
              maxLength={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            style={{
              width: '100%',
              backgroundColor: loading || pin.length !== 4 ? '#9ca3af' : '#ef4444',
              color: 'white',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || pin.length !== 4 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Verificando...' : 'Acceder al Panel Admin'}
          </button>
        </form>

        {/* Back to dashboard */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none', 
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Volver al Dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


