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
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos (reducido para evitar timeouts)

    // Obtener ambas tasas en paralelo: BCV (USD/VES), BCV EUR (si está disponible), y EUR/USD
    // Intentar múltiples APIs para obtener la tasa más actualizada
    const [bcvUSDResponse, bcvEURResponse, eurUsdResponse1, eurUsdResponse2] = await Promise.allSettled([
      fetch('https://bcvapi.tech/api/v1/dolar', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }),
      // Intentar obtener tasa EUR directamente del BCV (puede requerir plan premium o no estar disponible)
      fetch('https://bcvapi.tech/api/v1/euro', {
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

    // Procesar respuesta BCV USD/VES
    if (bcvUSDResponse.status !== 'fulfilled' || !bcvUSDResponse.value.ok) {
      throw new Error(`Error al obtener la tasa BCV: ${bcvUSDResponse.status === 'fulfilled' ? bcvUSDResponse.value.status : 'Failed'}`);
    }

    const bcvUSDData: BCVResponse = await bcvUSDResponse.value.json();
    const tasaUSD_VES_raw: number | string | undefined = bcvUSDData?.tasa || bcvUSDData?.precio || bcvUSDData?.precio_dolar || bcvUSDData?.valor;
    
    // Convertir a número si es string
    let tasaUSD_VES: number | null = null;
    if (typeof tasaUSD_VES_raw === 'number') {
      tasaUSD_VES = tasaUSD_VES_raw;
    } else if (typeof tasaUSD_VES_raw === 'string') {
      const tasaString: string = tasaUSD_VES_raw;
      const cleanedString = tasaString.replace(/[,\s]/g, '');
      tasaUSD_VES = parseFloat(cleanedString);
    }
    
    if (!tasaUSD_VES || isNaN(tasaUSD_VES) || tasaUSD_VES <= 0) {
      throw new Error('Tasa BCV no disponible');
    }

    // Intentar obtener tasa EUR/VES directamente del BCV
    let tasaEUR_VES_BCV: number | null = null;
    if (bcvEURResponse.status === 'fulfilled' && bcvEURResponse.value instanceof Response && bcvEURResponse.value.ok) {
      try {
        const bcvEURData: BCVResponse = await bcvEURResponse.value.json();
        const tasaRaw = bcvEURData?.tasa || bcvEURData?.precio || bcvEURData?.precio_dolar || bcvEURData?.valor;
        if (tasaRaw && typeof tasaRaw === 'number' && tasaRaw > 0) {
          tasaEUR_VES_BCV = tasaRaw;
          console.log('Tasa EUR/VES obtenida directamente del BCV:', tasaEUR_VES_BCV);
        }
      } catch (e) {
        console.warn('No se pudo obtener tasa EUR del BCV, usando cálculo:', e);
      }
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

    // Usar la tasa EUR/VES directamente del BCV si está disponible
    // Si no, calcular usando: EUR/VES = (EUR/USD) * (USD/VES)
    let tasaEUR_VES: number;
    
    if (tasaEUR_VES_BCV && tasaEUR_VES_BCV > 0) {
      // Usar la tasa oficial del BCV obtenida directamente
      tasaEUR_VES = tasaEUR_VES_BCV;
      console.log('Usando tasa EUR/VES oficial del BCV:', tasaEUR_VES);
    } else {
      // Calcular la tasa si no está disponible directamente
      const tasaEUR_VES_calculada = tasaEUR_USD * tasaUSD_VES;
      tasaEUR_VES = tasaEUR_VES_calculada;
      console.log('Usando tasa EUR/VES calculada (BCV no disponible):', tasaEUR_VES);
    }
    
    console.log('Tasas finales:', {
      tasaUSD_VES,
      tasaEUR_USD,
      tasaEUR_VES_BCV_directa: tasaEUR_VES_BCV,
      tasaEUR_VES_final: tasaEUR_VES
    });
    
    return NextResponse.json({ 
      success: true, 
      tasa: tasaEUR_USD, // EUR/USD para compatibilidad
      rate: tasaEUR_USD, // alias
      tasaEUR_VES: tasaEUR_VES, // EUR/VES oficial del BCV o calculada
      tasaUSD_VES: tasaUSD_VES, // USD/VES del BCV
      fecha: bcvUSDData?.fecha || null
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

