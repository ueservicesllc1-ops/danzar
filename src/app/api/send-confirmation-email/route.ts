import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════');
  console.log('📧 [EMAIL] Iniciando envío de email de confirmación');
  console.log('═══════════════════════════════════════════════════');
  
  try {
    console.log('[EMAIL] 1. Parseando body de la request...');
    const body = await request.json();
    console.log('[EMAIL] Body recibido:', JSON.stringify(body, null, 2));
    
    const {
      toEmail,
      customerName,
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      seats,
      totalAmount,
      confirmationCode,
      ticketUrl
    } = body;

    console.log('[EMAIL] 2. Validando campos requeridos...');
    console.log('[EMAIL] - toEmail:', toEmail ? '✓' : '✗', toEmail);
    console.log('[EMAIL] - customerName:', customerName ? '✓' : '✗', customerName);
    console.log('[EMAIL] - eventTitle:', eventTitle ? '✓' : '✗', eventTitle);
    console.log('[EMAIL] - confirmationCode:', confirmationCode ? '✓' : '✗', confirmationCode);

    // Validar que todos los campos requeridos estén presentes
    if (!toEmail || !customerName || !eventTitle || !confirmationCode) {
      console.error('[EMAIL] ✗ Validación falló - Faltan campos requeridos');
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    console.log('[EMAIL] ✓ Validación de campos exitosa');

    // Obtener credenciales de EmailJS desde variables de entorno
    console.log('[EMAIL] 3. Obteniendo credenciales de EmailJS desde variables de entorno...');
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    console.log('[EMAIL] Variables de entorno encontradas:');
    console.log('[EMAIL] - NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:', publicKey ? `✓ (${publicKey.substring(0, 10)}...)` : '✗ NO ENCONTRADA');
    console.log('[EMAIL] - NEXT_PUBLIC_EMAILJS_SERVICE_ID:', serviceId ? `✓ (${serviceId})` : '✗ NO ENCONTRADA');
    console.log('[EMAIL] - NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:', templateId ? `✓ (${templateId})` : '✗ NO ENCONTRADA');
    console.log('[EMAIL] - EMAILJS_PRIVATE_KEY:', privateKey ? `✓ (${privateKey.substring(0, 10)}...)` : '✗ NO ENCONTRADA');

    if (!publicKey || !serviceId || !templateId || !privateKey) {
      const missing = [];
      if (!publicKey) missing.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');
      if (!serviceId) missing.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID');
      if (!templateId) missing.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID');
      if (!privateKey) missing.push('EMAILJS_PRIVATE_KEY');
      
      console.error('[EMAIL] ✗ ERROR: Variables de entorno faltantes:', missing.join(', '));
      console.error('[EMAIL] Todas las variables de entorno disponibles:');
      console.error('[EMAIL] - process.env keys:', Object.keys(process.env).filter(k => k.includes('EMAIL')).join(', ') || 'NINGUNA');
      
      return NextResponse.json(
        { error: 'EmailJS no está configurado correctamente', details: `Faltan variables: ${missing.join(', ')}` },
        { status: 500 }
      );
    }
    console.log('[EMAIL] ✓ Todas las credenciales de EmailJS están presentes');

    // Formatear asientos para el email
    console.log('[EMAIL] 4. Formateando datos para el template...');
    console.log('[EMAIL] - seats recibidos:', Array.isArray(seats) ? `${seats.length} asientos` : 'N/A');
    
    const seatsList = Array.isArray(seats)
      ? seats.map((seat: { row: string; number: number }) => 
          `Fila ${seat.row} - Asiento ${seat.number}`
        ).join(', ')
      : 'N/A';

    // Preparar datos para el template de EmailJS
    const templateParams = {
      to_email: toEmail,
      to_name: customerName,
      event_title: eventTitle,
      event_date: eventDate || 'N/A',
      event_time: eventTime || 'N/A',
      event_venue: eventVenue || 'N/A',
      seats: seatsList,
      total_amount: `$${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}`,
      confirmation_code: confirmationCode,
      ticket_url: ticketUrl || `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${confirmationCode}`,
      app_name: process.env.NEXT_PUBLIC_APP_NAME || 'DanZar'
    };

    console.log('[EMAIL] Template params preparados:');
    console.log('[EMAIL]', JSON.stringify(templateParams, null, 2));

    // Enviar email usando EmailJS API REST directamente
    console.log('[EMAIL] 5. Llamando a EmailJS API REST...');
    console.log('[EMAIL] - serviceId:', serviceId);
    console.log('[EMAIL] - templateId:', templateId);
    console.log('[EMAIL] - publicKey:', publicKey.substring(0, 15) + '...');
    
    let response;
    try {
      console.log('[EMAIL] Enviando request a EmailJS API...');
      const sendStartTime = Date.now();
      
      // EmailJS API REST - usar accessToken en query params según documentación
      const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send?accessToken=${encodeURIComponent(privateKey)}`;
      
      const emailjsResponse = await fetch(emailjsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams
        })
      });
      
      const sendDuration = Date.now() - sendStartTime;
      
      // Obtener el texto de la respuesta primero
      const responseText = await emailjsResponse.text();
      console.log('[EMAIL] Response text (raw):', responseText.substring(0, 200));
      
      // Intentar parsear como JSON, si falla usar el texto
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Si no es JSON, es un error de texto plano
        console.error('[EMAIL] ✗ EmailJS devolvió texto plano en lugar de JSON');
        console.error('[EMAIL] Respuesta completa:', responseText);
        
        if (!emailjsResponse.ok) {
          throw {
            status: emailjsResponse.status,
            text: responseText,
            message: responseText
          };
        }
        
        // Si está OK pero no es JSON, asumir éxito
        responseData = { text: responseText };
      }
      
      if (!emailjsResponse.ok) {
        console.error('[EMAIL] ✗ EmailJS API respondió con error:');
        console.error('[EMAIL] Status:', emailjsResponse.status);
        console.error('[EMAIL] Response:', responseData);
        throw {
          status: emailjsResponse.status,
          text: responseData.message || responseData.text || responseText || 'Error desconocido',
          response: responseData
        };
      }
      
      response = {
        status: emailjsResponse.status,
        text: responseData.text || 'Email enviado exitosamente'
      };
      
      console.log('[EMAIL] ✓ EmailJS API completado en', sendDuration, 'ms');
      
    } catch (emailjsError: unknown) {
      const sendDuration = Date.now() - startTime;
      console.error('[EMAIL] ✗ ERROR en EmailJS API:');
      console.error('[EMAIL] ═══════════════════════════════════════════════════');
      const errorObj = emailjsError as { message?: string; text?: string; status?: number; response?: unknown; stack?: string };
      console.error('[EMAIL] Tipo de error:', typeof emailjsError);
      console.error('[EMAIL] Error instanceof Error:', emailjsError instanceof Error);
      console.error('[EMAIL] Mensaje:', errorObj?.message || errorObj?.text || 'Sin mensaje');
      console.error('[EMAIL] Status:', errorObj?.status || 'Sin status');
      console.error('[EMAIL] Response:', errorObj?.response ? JSON.stringify(errorObj.response) : 'Sin response');
      console.error('[EMAIL] Stack:', errorObj?.stack || 'Sin stack');
      console.error('[EMAIL] Error completo:');
      console.error('[EMAIL]', JSON.stringify(emailjsError, Object.getOwnPropertyNames(emailjsError), 2));
      console.error('[EMAIL] ═══════════════════════════════════════════════════');
      console.error('[EMAIL] Tiempo hasta el error:', sendDuration, 'ms');
      throw emailjsError;
    }

    console.log('[EMAIL] 6. Respuesta de EmailJS:');
    console.log('[EMAIL] - Status:', response?.status);
    console.log('[EMAIL] - Text:', response?.text);
    console.log('[EMAIL] - Response completa:', JSON.stringify(response, null, 2));

    const totalDuration = Date.now() - startTime;
    console.log('[EMAIL] ✓ Email enviado exitosamente en', totalDuration, 'ms');
    console.log('═══════════════════════════════════════════════════');
    
    return NextResponse.json({
      success: true,
      message: 'Email de confirmación enviado exitosamente',
      messageId: response.text || 'Email enviado',
      status: response.status
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('[EMAIL] ✗ ERROR GENERAL CAPTURADO:');
    console.error('[EMAIL] ═══════════════════════════════════════════════════');
    console.error('[EMAIL] Tipo:', typeof error);
    console.error('[EMAIL] Es Error:', error instanceof Error);
    
    if (error instanceof Error) {
      console.error('[EMAIL] Nombre:', error.name);
      console.error('[EMAIL] Mensaje:', error.message);
      console.error('[EMAIL] Stack:');
      console.error(error.stack);
    } else {
      console.error('[EMAIL] Error (no es instancia de Error):');
      console.error('[EMAIL]', error);
    }
    
    console.error('[EMAIL] Error serializado:');
    try {
      console.error('[EMAIL]', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (stringifyError) {
      console.error('[EMAIL] No se pudo serializar el error:', stringifyError);
      console.error('[EMAIL] Error como string:', String(error));
    }
    
    console.error('[EMAIL] Tiempo total hasta el error:', totalDuration, 'ms');
    console.error('[EMAIL] ═══════════════════════════════════════════════════');
    console.error('═══════════════════════════════════════════════════');
    
    // Intentar obtener más información del error
    const errorDetails: {
      message: string;
      type: string;
      response?: unknown;
      status?: number;
      statusText?: string;
      code?: string;
      config?: unknown;
    } = {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.name : typeof error
    };

    // Si el error tiene propiedades adicionales, incluirlas
    if (error && typeof error === 'object') {
      try {
        const errorObj = error as {
          response?: unknown;
          status?: number;
          statusText?: string;
          code?: string;
          config?: unknown;
        };
        if (errorObj.response) errorDetails.response = errorObj.response;
        if (errorObj.status) errorDetails.status = errorObj.status;
        if (errorObj.statusText) errorDetails.statusText = errorObj.statusText;
        if (errorObj.code) errorDetails.code = errorObj.code;
        if (errorObj.config) errorDetails.config = errorObj.config;
      } catch {
        // Ignorar errores al intentar serializar
      }
    }

    return NextResponse.json(
      { 
        error: 'Error al enviar el email de confirmación',
        details: errorDetails,
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10).join('\n') : undefined
      },
      { status: 500 }
    );
  }
}

