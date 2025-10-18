import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, receiptUrl, userId } = body;

    if (!paymentId || !receiptUrl || !userId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Actualizar el documento del pago en Firestore
    const paymentRef = doc(db, 'payments', paymentId);
    
    await updateDoc(paymentRef, {
      receiptUrl: receiptUrl,
      receiptUploadedAt: serverTimestamp(),
      receiptStatus: 'pending_review',
      updatedAt: serverTimestamp(),
    });

    // Crear notificación para el admin
    const notificationRef = doc(db, 'notifications', `${paymentId}-${Date.now()}`);
    await updateDoc(notificationRef, {
      type: 'payment_receipt_uploaded',
      paymentId: paymentId,
      userId: userId,
      receiptUrl: receiptUrl,
      status: 'unread',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Recibo guardado exitosamente',
    });

  } catch (error) {
    console.error('Error al guardar recibo:', error);
    return NextResponse.json(
      { error: 'Error al guardar el recibo' },
      { status: 500 }
    );
  }
}


