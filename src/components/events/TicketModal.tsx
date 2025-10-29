'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Calendar, MapPin, Clock, User, Ticket as TicketIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Seat, Event } from '@/types/events';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  seats: Seat[];
  confirmationCode: string;
}

export default function TicketModal({ 
  isOpen, 
  onClose, 
  event, 
  seats,
  confirmationCode 
}: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // En una aplicación real, aquí generarías un PDF
    alert('Descargando ticket...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket - ${event.title}`,
        text: `Mi ticket para ${event.title} - Código: ${confirmationCode}`,
      });
    } else {
      alert('Función de compartir no disponible');
    }
  };

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = totalPrice * 0.1;
  const finalTotal = totalPrice + serviceFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <TicketIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">¡Compra Exitosa!</h2>
                    <p className="text-sm text-gray-600">Tu ticket está listo</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Ticket Content */}
              <div className="p-8 flex justify-center">
                <div ref={ticketRef} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden shadow-lg border-4 border-white w-full max-w-3xl">
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative overflow-hidden w-full">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <TicketIcon className="w-6 h-6" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Ticket Digital</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                      <p className="text-xl text-white/90">{event.artist}</p>
                    </div>
                  </div>

                  {/* Perforated edge effect */}
                  <div className="relative h-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="absolute top-0 left-0 right-0 flex justify-between">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-white rounded-full -mt-2"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Left Side - Event Details */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">Fecha y Hora</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{event.date}</p>
                          <p className="text-gray-700">{event.time}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">Ubicación</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{event.venue}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">Asientos</span>
                          </div>
                          <div className="space-y-1">
                            {seats.map((seat) => (
                              <div key={seat.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                                <span className="font-semibold text-gray-900">
                                  Fila {seat.row} - Asiento {seat.number}
                                </span>
                                <span className="text-sm text-gray-600 capitalize">{seat.category}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-300">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Cargo por servicio</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total Pagado</span>
                            <span>${finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - QR Code */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-gray-100">
                          <QRCodeSVG
                            value={`TICKET-${confirmationCode}-${event.id}`}
                            size={180}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: "/images/logo.png",
                              height: 35,
                              width: 35,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="mt-5 text-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Código de Confirmación</p>
                          <p className="text-base font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">{confirmationCode}</p>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-5 max-w-xs leading-relaxed">
                          Presenta este código QR en la entrada del evento
                        </p>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800">
                        <strong>Importante:</strong> Guarda este ticket. Lo necesitarás para ingresar al evento. 
                        Se recomienda descargar o tomar una captura de pantalla.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="px-8 pb-8 flex justify-center">
                <div className="w-full max-w-3xl">
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Descargar Ticket
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="px-6 py-6 rounded-xl border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all duration-300"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Email Notice */}
                  <p className="text-center text-sm text-gray-500 mt-4">
                    También hemos enviado una copia de tu ticket a tu correo electrónico
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

