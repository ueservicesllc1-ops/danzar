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

interface FrankfurterResponse {
  rates?: {
    EUR?: number;
  };
}

interface BCVResponse {
  tasa?: number;
  precio?: number;
  precio_dolar?: number;
  valor?: number;
  fecha?: string;
}

export async function GET() {
  try {
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    // Obtener ambas tasas en paralelo: BCV (USD/VES) y EUR/USD
    // Intentar múltiples APIs para EUR/USD para obtener la más actualizada
    const [bcvResponse, eurUsdResponse1, eurUsdResponse2] = await Promise.allSettled([
      fetch('https://bcvapi.tech/api/v1/dolar', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }),
      fetch('https://api.frankfurter.app/latest?from=USD&to=EUR', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }),
      fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    // Procesar respuesta BCV
    if (bcvResponse.status !== 'fulfilled' || !bcvResponse.value.ok) {
      throw new Error(`Error al obtener la tasa BCV: ${bcvResponse.status === 'fulfilled' ? bcvResponse.value.status : 'Failed'}`);
    }

    const bcvData: BCVResponse = await bcvResponse.value.json();
    const tasaUSD_VES = bcvData?.tasa || bcvData?.precio || bcvData?.precio_dolar || bcvData?.valor;
    
    if (!tasaUSD_VES || typeof tasaUSD_VES !== 'number' || tasaUSD_VES <= 0) {
      throw new Error('Tasa BCV no disponible');
    }

    // Procesar respuesta EUR/USD - intentar múltiples fuentes
    let tasaEUR_USD: number | null = null;
    
    // Intentar Frankfurter (API del BCE - Banco Central Europeo) - más actualizada
    if (eurUsdResponse1.status === 'fulfilled' && eurUsdResponse1.value.ok) {
      try {
        const frankData: FrankfurterResponse = await eurUsdResponse1.value.json();
        const frankRate = frankData?.rates?.EUR;
        if (frankRate && typeof frankRate === 'number' && frankRate > 0) {
          // Frankfurter devuelve USD/EUR (ej: 1 USD = 0.92 EUR)
          // Necesitamos invertir para obtener EUR/USD (ej: 1 EUR = 1/0.92 = 1.087 USD)
          tasaEUR_USD = 1 / frankRate;
        }
      } catch (e) {
        console.warn('Error procesando Frankfurter (API BCE):', e);
      }
    }
    
    // Si Frankfurter falló, intentar exchangerate-api
    if (!tasaEUR_USD && eurUsdResponse2.status === 'fulfilled' && eurUsdResponse2.value.ok) {
      try {
        const eurUsdData: ExchangeRateResponse = await eurUsdResponse2.value.json();
        const rateValue = eurUsdData?.rates?.EUR || eurUsdData?.conversion_rates?.EUR || eurUsdData?.EUR || eurUsdData?.result;
        if (rateValue && typeof rateValue === 'number' && rateValue > 0) {
          tasaEUR_USD = rateValue;
        }
      } catch (e) {
        console.warn('Error procesando exchangerate-api:', e);
      }
    }
    
    if (!tasaEUR_USD || typeof tasaEUR_USD !== 'number' || tasaEUR_USD <= 0) {
      throw new Error('Tasa EUR/USD no disponible de ninguna fuente');
    }

    // Calcular EUR/VES usando la tasa del BCV: EUR/VES = (EUR/USD) * (USD/VES)
    // Pero también devolvemos EUR/USD para conversiones
    const tasaEUR_VES = tasaEUR_USD * tasaUSD_VES;
    
    return NextResponse.json({ 
      success: true, 
      tasa: tasaEUR_USD, // EUR/USD para compatibilidad
      rate: tasaEUR_USD, // alias
      tasaEUR_VES: tasaEUR_VES, // EUR/VES calculado usando BCV
      tasaUSD_VES: tasaUSD_VES, // USD/VES del BCV
      fecha: bcvData?.fecha || null
    });
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

