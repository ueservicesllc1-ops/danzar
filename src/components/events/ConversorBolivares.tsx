'use client';

import { useState, useEffect } from 'react';

interface ConversorBolivaresProps {
  montoUSD: number; // Mantener el nombre para compatibilidad, pero ahora es EUR
  montoEUR?: number; // Nuevo prop opcional para claridad
}

export default function ConversorBolivares({ montoUSD, montoEUR }: ConversorBolivaresProps) {
  // Usar montoEUR si está disponible, sino usar montoUSD (para compatibilidad)
  const monto = montoEUR ?? montoUSD;
  const [tasaBCV, setTasaBCV] = useState<number | null>(null);
  const [tasaEUR_USD, setTasaEUR_USD] = useState<number | null>(null);
  const [tasaEUR_VES, setTasaEUR_VES] = useState<number | null>(null); // Nueva tasa EUR/VES calculada con BCV
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorEUR, setErrorEUR] = useState(false);

  useEffect(() => {
    const fetchTasas = async () => {
      setLoading(true);
      setError(false);
      setErrorEUR(false);
      
      // Obtener ambas tasas en paralelo
      const [bcvResponse, eurResponse] = await Promise.allSettled([
        fetch('/api/get-bcv-rate', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }),
        fetch('/api/get-eur-rate', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }),
      ]);

      // Procesar respuesta BCV
      if (bcvResponse.status === 'fulfilled') {
        try {
          const response = bcvResponse.value;
          if (!response.ok) {
            if (response.status === 503 || response.status === 404) {
              const errorData = await response.json().catch(() => ({}));
              console.warn('API BCV no disponible:', errorData.error || 'Servicio no disponible');
              setError(true);
              setTasaBCV(null);
            } else {
              throw new Error(`Error al obtener la tasa BCV: ${response.status}`);
            }
          } else {
            const data = await response.json();
            if (data.success && data.tasa && typeof data.tasa === 'number' && data.tasa > 0) {
              setTasaBCV(data.tasa);
            } else {
              console.warn('Tasa BCV no disponible en la respuesta');
              setError(true);
              setTasaBCV(null);
            }
          }
        } catch (err) {
          console.warn('Error procesando tasa BCV:', err instanceof Error ? err.message : 'Error desconocido');
          setError(true);
          setTasaBCV(null);
        }
      } else {
        console.warn('Error obteniendo tasa BCV:', bcvResponse.reason);
        setError(true);
        setTasaBCV(null);
      }

      // Procesar respuesta EUR
      if (eurResponse.status === 'fulfilled') {
        try {
          const response = eurResponse.value;
          if (!response.ok) {
            if (response.status === 503 || response.status === 404) {
              const errorData = await response.json().catch(() => ({}));
              console.warn('API EUR no disponible:', errorData.error || 'Servicio no disponible');
              setErrorEUR(true);
              setTasaEUR_USD(null);
              setTasaEUR_VES(null);
            } else {
              throw new Error(`Error al obtener la tasa EUR: ${response.status}`);
            }
          } else {
            const data = await response.json();
            if (data.success && data.tasa && typeof data.tasa === 'number' && data.tasa > 0) {
              setTasaEUR_USD(data.tasa); // EUR/USD
              // Si viene la tasa EUR/VES calculada con BCV, usarla
              if (data.tasaEUR_VES && typeof data.tasaEUR_VES === 'number' && data.tasaEUR_VES > 0) {
                setTasaEUR_VES(data.tasaEUR_VES);
              }
            } else {
              console.warn('Tasa EUR no disponible en la respuesta');
              setErrorEUR(true);
              setTasaEUR_USD(null);
              setTasaEUR_VES(null);
            }
          }
        } catch (err) {
          console.warn('Error procesando tasa EUR:', err instanceof Error ? err.message : 'Error desconocido');
          setErrorEUR(true);
          setTasaEUR_USD(null);
          setTasaEUR_VES(null);
        }
      } else {
        console.warn('Error obteniendo tasa EUR:', eurResponse.reason);
        setErrorEUR(true);
        setTasaEUR_USD(null);
        setTasaEUR_VES(null);
      }

      setLoading(false);
    };

    fetchTasas();
  }, []);

  if (loading) {
    return (
      <div style={{ marginTop: '10px' }}>
        <p style={{
          fontSize: '16px',
          color: '#d4af37',
          margin: '0 0 8px 0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.5',
          fontWeight: 500
        }}>
          Cargando tasas...
        </p>
      </div>
    );
  }

  // Si el monto está en EUR, usar la tasa EUR/VES calculada con BCV directamente
  // Si no, convertir USD a Bs usando tasa BCV
  let equivalenteVES: string | null = null;
  
  if (montoEUR !== undefined && tasaEUR_VES && !errorEUR) {
    // Monto en EUR: usar tasa EUR/VES calculada con BCV
    equivalenteVES = (monto * tasaEUR_VES).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (tasaBCV && !error) {
    // Monto en USD: usar tasa BCV directamente
    equivalenteVES = (monto * tasaBCV).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Mostrar equivalente en USD si el monto está en EUR
  const equivalenteUSD = (tasaEUR_USD && !errorEUR && montoEUR !== undefined)
    ? (monto / tasaEUR_USD).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  // Calcular tasas para mostrar al lado derecho
  const tasaUSD_VES = tasaBCV && !error 
    ? tasaBCV.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  // Usar la tasa EUR/VES calculada con BCV que viene de la API
  // Si no está disponible, calcularla usando EUR/USD * USD/VES
  const tasaEUR_VES_Display = tasaEUR_VES && !errorEUR
    ? tasaEUR_VES.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : (tasaEUR_USD && tasaBCV && !errorEUR && !error)
      ? (tasaEUR_USD * tasaBCV).toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
      {/* Conversiones del monto total - lado izquierdo */}
      <div style={{ flex: 1 }}>
        {equivalenteVES && (
          <p style={{
            fontSize: '18px',
            color: '#d4af37',
            margin: '0 0 8px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            lineHeight: '1.5'
          }}>
            ≈ {equivalenteVES} Bs <span style={{ fontSize: '14px', fontWeight: 400 }}>(Tasa BCV)</span>
          </p>
        )}
        {equivalenteUSD && (
          <p style={{
            fontSize: '18px',
            color: '#d4af37',
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            lineHeight: '1.5'
          }}>
            ≈ ${equivalenteUSD} <span style={{ fontSize: '14px', fontWeight: 400 }}>(USD)</span>
          </p>
        )}
        {!equivalenteVES && !equivalenteUSD && (
          <p style={{
            fontSize: '16px',
            color: '#d4af37',
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            Tasas no disponibles
          </p>
        )}
      </div>

      {/* Tasas de cambio - lado derecho */}
      <div style={{
        flex: '0 0 auto',
        textAlign: 'right',
        borderLeft: '1px solid #efb810',
        paddingLeft: '15px'
      }}>
        {tasaEUR_VES_Display && (
          <p style={{
            fontSize: '14px',
            color: '#d4af37',
            margin: '0 0 8px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            lineHeight: '1.4'
          }}>
            1 EUR = {tasaEUR_VES_Display} Bs
          </p>
        )}
        {tasaUSD_VES && (
          <p style={{
            fontSize: '14px',
            color: '#d4af37',
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            lineHeight: '1.4'
          }}>
            1 USD = {tasaUSD_VES} Bs
          </p>
        )}
      </div>
    </div>
  );
}

