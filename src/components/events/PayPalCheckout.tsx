'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Seat, PaymentDetails } from '@/types/events';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';

interface PayPalCheckoutProps {
  seats: Seat[];
  onSuccess: (details: PaymentDetails) => void;
  onError: (error: Error | unknown) => void;
}

export default function PayPalCheckout({ seats, onSuccess, onError }: PayPalCheckoutProps) {
  const basePrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  
  // Calcular precio con descuentos por paquetes
  const numTickets = seats.length;
  let totalPrice = basePrice;
  
  if (numTickets === 3) {
    totalPrice = 30;
  } else if (numTickets === 5) {
    totalPrice = 45;
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  if (!clientId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-800 text-sm">
          Error: PayPal no está configurado correctamente
        </p>
      </div>
    );
  }

  // PayPal detecta automáticamente el modo (sandbox/live) basándose en el Client ID
  // No necesitamos detectarlo manualmente

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <CreditCard className="w-6 h-6" style={{ color: '#efb810' }} />
          <h3 className="text-2xl font-bold text-gray-900">Pago Seguro</h3>
        </div>
        <p className="text-gray-600">
          Completa tu compra con PayPal de forma segura
        </p>
      </motion.div>

      {/* Price Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl p-6 border border-gray-200"
        style={{ background: 'linear-gradient(135deg, rgba(239, 184, 16, 0.05) 0%, rgba(155, 0, 0, 0.05) 100%)' }}
      >
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total a Pagar</span>
            <span className="text-2xl font-bold" style={{ color: '#9B0000' }}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* PayPal Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg"
      >
        <PayPalScriptProvider
          options={{
            clientId: clientId,
            currency: 'USD',
            intent: 'capture',
          }}
          deferLoading={false}
        >
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 55,
            }}
            createOrder={(data, actions) => {
              // Calcular item_total basado en totalPrice
              const itemTotal = numTickets === 3 ? 30 : numTickets === 5 ? 45 : basePrice;
              
              // Si hay descuento, ajustar el precio por asiento
              const adjustedSeatPrice = itemTotal / numTickets;
              
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    description: `The Greatest Showdance - ${seats.length} Ticket(s)`,
                    amount: {
                      currency_code: 'USD',
                      value: totalPrice.toFixed(2),
                      breakdown: {
                        item_total: {
                          currency_code: 'USD',
                          value: totalPrice.toFixed(2),
                        },
                      },
                    },
                    items: seats.map((seat, index) => {
                      // Para mantener la consistencia, usar precio ajustado
                      const finalPrice = (numTickets === 3 || numTickets === 5) 
                        ? adjustedSeatPrice 
                        : seat.price;
                      
                      return {
                        name: `Asiento ${seat.row}${seat.number}`,
                        unit_amount: {
                          currency_code: 'USD',
                          value: finalPrice.toFixed(2),
                        },
                        quantity: '1',
                        category: 'DIGITAL_GOODS' as const,
                      };
                    }),
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (actions.order) {
                try {
                  const details = await actions.order.capture();
                  // Convertir detalles de PayPal a PaymentDetails
                  const paymentDetails: PaymentDetails = {
                    id: (details as { id?: string }).id || `paypal-${Date.now()}`,
                  };
                  // Agregar propiedades adicionales de PayPal si existen
                  if ((details as { id?: string }).id) {
                    (paymentDetails as Record<string, unknown>).paypalOrderId = (details as { id: string }).id;
                  }
                  if ((details as { status?: string }).status) {
                    (paymentDetails as Record<string, unknown>).paypalStatus = (details as { status: string }).status;
                  }
                  if ((details as { payer?: unknown }).payer) {
                    (paymentDetails as Record<string, unknown>).payer = (details as { payer: unknown }).payer;
                  }
                  if ((details as { purchase_units?: unknown }).purchase_units) {
                    (paymentDetails as Record<string, unknown>).purchase_units = (details as { purchase_units: unknown }).purchase_units;
                  }
                  onSuccess(paymentDetails);
                } catch (error) {
                  console.error('Error capturando orden de PayPal:', error);
                  onError(error);
                }
              }
            }}
            onError={(err) => {
              console.error('PayPal Error:', err);
              onError(err instanceof Error ? err : new Error('Error desconocido de PayPal'));
            }}
            onCancel={() => {
              console.log('Payment cancelled by user');
            }}
          />
        </PayPalScriptProvider>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-gray-500"
      >
        <Lock className="w-4 h-4" />
        <span>Pago 100% seguro y encriptado con PayPal</span>
      </motion.div>
    </div>
  );
}


