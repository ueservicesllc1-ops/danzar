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
      
      try {
        // Obtener tasa USD/VES del BCV
        const bcvResponse = await fetch('/api/get-bcv-rate', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        
        if (bcvResponse.ok) {
          const bcvData = await bcvResponse.json();
          if (bcvData.success && bcvData.tasa && typeof bcvData.tasa === 'number' && bcvData.tasa > 0) {
            setTasaBCV(bcvData.tasa);
            
            // Obtener tasa EUR/USD desde API route (evita problemas de CORS)
            try {
              const eurUsdResponse = await fetch('/api/get-eur-usd', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
              });
              
              if (eurUsdResponse.ok) {
                const eurUsdData = await eurUsdResponse.json();
                if (eurUsdData.success && eurUsdData.tasa && typeof eurUsdData.tasa === 'number' && eurUsdData.tasa > 0) {
                  const tasaEUR_USD = eurUsdData.tasa;
                  setTasaEUR_USD(tasaEUR_USD);
                  
                  // Calcular EUR/VES = EUR/USD × USD/VES
                  const tasaEUR_VES_calculada = tasaEUR_USD * bcvData.tasa;
                  setTasaEUR_VES(tasaEUR_VES_calculada);
                } else {
                  setErrorEUR(true);
                }
              } else {
                setErrorEUR(true);
              }
            } catch (err) {
              console.warn('Error obteniendo tasa EUR/USD:', err);
              setErrorEUR(true);
            }
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.warn('Error obteniendo tasas:', err);
        setError(true);
        setErrorEUR(true);
      } finally {
        setLoading(false);
      }
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
        {/* Ocultar equivalente USD - mantener código pero no mostrar */}
        {false && equivalenteUSD && (
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
        {/* Ocultar tasa USD - mantener código pero no mostrar */}
        {false && tasaUSD_VES && (
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

