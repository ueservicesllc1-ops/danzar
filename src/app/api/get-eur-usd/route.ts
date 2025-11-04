import { NextResponse } from 'next/server';

interface FrankfurterResponse {
  rates?: {
    EUR?: number;
  };
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error al obtener la tasa EUR/USD: ${response.status}`);
    }

    const data: FrankfurterResponse = await response.json();
    const frankRate = data?.rates?.EUR;
    
    if (frankRate && typeof frankRate === 'number' && frankRate > 0) {
      // Frankfurter devuelve USD/EUR (ej: 1 USD = 0.92 EUR)
      // Necesitamos invertir para obtener EUR/USD (ej: 1 EUR = 1/0.92 = 1.087 USD)
      const tasaEUR_USD = 1 / frankRate;
      
      return NextResponse.json({
        success: true,
        tasa: tasaEUR_USD,
      });
    } else {
      throw new Error('Tasa EUR/USD no disponible');
    }
  } catch (error) {
    console.error('Error obteniendo tasa EUR/USD:', error);
    
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
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Tasa EUR/USD no disponible'
      },
      { status: 500 }
    );
  }
}

