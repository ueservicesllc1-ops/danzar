import { NextResponse } from 'next/server';

interface BCVAPIResponse {
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

    // Usar BCV API - API confiable y pública del Banco Central de Venezuela
    const response = await fetch('https://bcvapi.tech/api/v1/dolar', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error al obtener la tasa: ${response.status}`);
    }

    const data: BCVAPIResponse = await response.json();
    
    // La API BCV devuelve la tasa en diferentes campos posibles
    // Intentar obtener la tasa de diferentes formas
    const tasaRaw: number | string | undefined = data?.tasa || data?.precio || data?.precio_dolar || data?.valor;
    
    // Convertir a número si es string
    let tasaNumber: number | null = null;
    if (typeof tasaRaw === 'number') {
      tasaNumber = tasaRaw;
    } else if (typeof tasaRaw === 'string') {
      // Remover comas y espacios, luego convertir
      const tasaString: string = tasaRaw;
      const cleanedString = tasaString.replace(/[,\s]/g, '');
      tasaNumber = parseFloat(cleanedString);
    }
    
    if (tasaNumber && tasaNumber > 0) {
      return NextResponse.json({ 
        success: true, 
        tasa: tasaNumber,
        price: tasaNumber, // alias para compatibilidad
        fecha: data?.fecha || null
      });
    } else {
      throw new Error('Tasa no disponible en la respuesta de la API');
    }
  } catch (error) {
    console.error('Error obteniendo tasa BCV:', error);
    
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
        error: 'Tasa no disponible. La API externa no está respondiendo correctamente.' 
      },
      { status: 500 }
    );
  }
}

