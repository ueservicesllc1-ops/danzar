import { NextResponse } from 'next/server';

interface ExchangeRateResponse {
  rates?: {
    EUR?: number;
  };
  EUR?: number;
  result?: number;
  conversion_rates?: {
    EUR?: number;
  };
}

export async function GET() {
  try {
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    // Usar exchangerate-api.com - versión gratuita sin API key (puede tener límites pero funciona)
    // Alternativa: usar una API simple y confiable
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error al obtener la tasa EUR: ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();
    
    // Extraer la tasa EUR/USD - la API v4 devuelve en rates.EUR
    const tasaEUR = data?.rates?.EUR || data?.conversion_rates?.EUR || data?.EUR || data?.result;
    
    if (tasaEUR && typeof tasaEUR === 'number' && tasaEUR > 0) {
      return NextResponse.json({ 
        success: true, 
        tasa: tasaEUR,
        rate: tasaEUR // alias para compatibilidad
      });
    } else {
      throw new Error('Tasa EUR no disponible en la respuesta');
    }
  } catch (error) {
    console.error('Error obteniendo tasa EUR:', error);
    
    // Si es un error de timeout o network, retornar un mensaje específico
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Timeout: La solicitud tardó demasiado' 
          },
          { status: 503 }
        );
      }
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error de conexión. Verifica tu conexión a internet.' 
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Tasa EUR no disponible' 
      },
      { status: 500 }
    );
  }
}

