'use client';

import { useState, useEffect } from 'react';

interface ConversorBolivaresProps {
  montoUSD: number;
}

export default function ConversorBolivares({ montoUSD }: ConversorBolivaresProps) {
  const [tasaBCV, setTasaBCV] = useState<number | null>(null);
  const [tasaEUR, setTasaEUR] = useState<number | null>(null);
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
              setTasaEUR(null);
            } else {
              throw new Error(`Error al obtener la tasa EUR: ${response.status}`);
            }
          } else {
            const data = await response.json();
            if (data.success && data.tasa && typeof data.tasa === 'number' && data.tasa > 0) {
              setTasaEUR(data.tasa);
            } else {
              console.warn('Tasa EUR no disponible en la respuesta');
              setErrorEUR(true);
              setTasaEUR(null);
            }
          }
        } catch (err) {
          console.warn('Error procesando tasa EUR:', err instanceof Error ? err.message : 'Error desconocido');
          setErrorEUR(true);
          setTasaEUR(null);
        }
      } else {
        console.warn('Error obteniendo tasa EUR:', eurResponse.reason);
        setErrorEUR(true);
        setTasaEUR(null);
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

  const equivalenteVES = tasaBCV && !error 
    ? (montoUSD * tasaBCV).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  const equivalenteEUR = tasaEUR && !errorEUR
    ? (montoUSD * tasaEUR).toLocaleString('es-ES', {
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

  // 1 EUR = (1 EUR en USD) * (1 USD en Bs) = tasaEUR * tasaBCV
  const tasaEUR_VES = (tasaEUR && tasaBCV && !errorEUR && !error)
    ? (tasaEUR * tasaBCV).toLocaleString('es-VE', {
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
        {equivalenteEUR && (
          <p style={{
            fontSize: '18px',
            color: '#d4af37',
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            lineHeight: '1.5'
          }}>
            ≈ €{equivalenteEUR} <span style={{ fontSize: '14px', fontWeight: 400 }}>(EUR)</span>
          </p>
        )}
        {!equivalenteVES && !equivalenteEUR && (
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
        {tasaUSD_VES && (
          <p style={{
            fontSize: '14px',
            color: '#d4af37',
            margin: '0 0 8px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            lineHeight: '1.4'
          }}>
            1 USD = {tasaUSD_VES} Bs
          </p>
        )}
        {tasaEUR_VES && (
          <p style={{
            fontSize: '14px',
            color: '#d4af37',
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            lineHeight: '1.4'
          }}>
            1 EUR = {tasaEUR_VES} Bs
          </p>
        )}
      </div>
    </div>
  );
}

