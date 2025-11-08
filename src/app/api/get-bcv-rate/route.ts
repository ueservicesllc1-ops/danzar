import { NextResponse } from 'next/server';

interface DolarApiResponse {
  fuente?: string;
  nombre?: string;
  promedio?: number | string;
  fechaActualizacion?: string;
}

const DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(DOLAR_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DanZarApp/1.0 (+https://danzar.art)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error al obtener la tasa: ${response.status}`);
    }

    const data: DolarApiResponse = await response.json();
    const tasaRaw = data?.promedio;

    const tasaNumber =
      typeof tasaRaw === 'number'
        ? tasaRaw
        : typeof tasaRaw === 'string'
          ? Number.parseFloat(tasaRaw.replace(/[,\s]/g, ''))
          : NaN;

    if (Number.isFinite(tasaNumber) && tasaNumber > 0) {
      return NextResponse.json({ 
        success: true, 
        tasa: tasaNumber,
        price: tasaNumber,
        fuente: data?.nombre || data?.fuente || 'BCV (DolarAPI)',
        fecha: data?.fechaActualizacion || null,
      });
    } else {
      throw new Error('Tasa no disponible en la respuesta de la API');
    }
  } catch (error) {
    console.error('Error obteniendo tasa BCV:', error);
    
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
        error: 'Tasa no disponible. La API externa no está respondiendo correctamente.' 
      },
      { status: 500 }
    );
  }
}

