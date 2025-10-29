'use client';

import { motion } from 'framer-motion';
import { Seat, SeatStatus, SeatCategory } from '@/types/events';
import { Monitor } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  selectedSeats: Seat[];
}

const categoryColors = {
  vip: {
    available: 'bg-purple-500 hover:bg-purple-600',
    selected: 'bg-purple-700 ring-4 ring-purple-300',
    occupied: 'bg-gray-400 cursor-not-allowed',
    reserved: 'bg-gray-300 cursor-not-allowed'
  },
  premium: {
    available: 'bg-blue-500 hover:bg-blue-600',
    selected: 'bg-blue-700 ring-4 ring-blue-300',
    occupied: 'bg-gray-400 cursor-not-allowed',
    reserved: 'bg-gray-300 cursor-not-allowed'
  },
  standard: {
    available: 'bg-green-500 hover:bg-green-600',
    selected: 'bg-green-700 ring-4 ring-green-300',
    occupied: 'bg-gray-400 cursor-not-allowed',
    reserved: 'bg-gray-300 cursor-not-allowed'
  },
  balcony: {
    available: 'bg-orange-500 hover:bg-orange-600',
    selected: 'bg-orange-700 ring-4 ring-orange-300',
    occupied: 'bg-gray-400 cursor-not-allowed',
    reserved: 'bg-gray-300 cursor-not-allowed'
  }
};

const categoryLabels = {
  vip: 'VIP',
  premium: 'Premium',
  standard: 'Estándar',
  balcony: 'Balcón'
};

export default function SeatMap({ seats, onSeatSelect, selectedSeats }: SeatMapProps) {
  const rows = Array.from(new Set(seats.map(seat => seat.row))).sort();
  
  const getSeatsByRow = (row: string) => {
    return seats.filter(seat => seat.row === row).sort((a, b) => a.number - b.number);
  };

  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some(s => s.id === seat.id);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available' || seat.status === 'selected') {
      onSeatSelect(seat);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col items-center">
      {/* Escenario */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 w-full max-w-4xl"
      >
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-4">
            <Monitor className="w-8 h-8 text-white" />
            <h3 className="text-2xl font-bold text-white tracking-wider">ESCENARIO</h3>
            <Monitor className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          ↑ Vista desde aquí
        </div>
      </motion.div>

      {/* Mapa de asientos */}
      <div className="space-y-4 mb-12 flex flex-col items-center w-full">
        {rows.map((row, rowIndex) => {
          const rowSeats = getSeatsByRow(row);
          const category = rowSeats[0]?.category;
          
          return (
            <motion.div
              key={row}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: rowIndex * 0.05 }}
              className="flex items-center justify-center gap-2"
            >
              {/* Etiqueta de fila */}
              <div className="w-12 text-center font-bold text-gray-700 text-lg">
                {row}
              </div>

              {/* Asientos */}
              <div className="flex gap-2 flex-wrap justify-center">
                {rowSeats.map((seat, seatIndex) => {
                  const isSelected = isSeatSelected(seat);
                  const status = isSelected ? 'selected' : seat.status;
                  const colorClass = categoryColors[seat.category][status];
                  const isClickable = seat.status === 'available' || isSelected;

                  return (
                    <motion.button
                      key={seat.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: rowIndex * 0.05 + seatIndex * 0.02 }}
                      whileHover={isClickable ? { scale: 1.1 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!isClickable}
                      className={`
                        w-10 h-10 rounded-lg transition-all duration-200
                        flex items-center justify-center text-white text-xs font-semibold
                        ${colorClass}
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                        shadow-md hover:shadow-lg
                      `}
                      title={`${row}${seat.number} - ${categoryLabels[seat.category]} - $${seat.price}`}
                    >
                      {seat.number}
                    </motion.button>
                  );
                })}
              </div>

              {/* Etiqueta de fila (derecha) */}
              <div className="w-12 text-center font-bold text-gray-700 text-lg">
                {row}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 w-full max-w-4xl"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Categorías */}
          {Object.entries(categoryLabels).map(([key, label]) => {
            const category = key as SeatCategory;
            const sampleSeat = seats.find(s => s.category === category);
            
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${categoryColors[category].available}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">${sampleSeat?.price}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500" />
              <span className="text-sm text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-700 ring-4 ring-green-300" />
              <span className="text-sm text-gray-700">Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-400" />
              <span className="text-sm text-gray-700">Ocupado</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

