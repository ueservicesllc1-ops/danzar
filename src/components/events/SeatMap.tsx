'use client';

import { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const rows = Array.from(new Set(seats.map(seat => seat.row))).sort();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const getSeatsByRow = (row: string) => {
    return seats.filter(seat => seat.row === row).sort((a, b) => a.number - b.number);
  };

  const getLeftNaveSeats = (row: string) => {
    return getSeatsByRow(row).filter(seat => seat.number <= 12);
  };

  const getRightNaveSeats = (row: string) => {
    return getSeatsByRow(row).filter(seat => seat.number > 12);
  };

  const splitSeatsIntoGroups = (row: string, groupSize: number) => {
    const seats = getSeatsByRow(row);
    const groups = [];
    for (let i = 0; i < seats.length; i += groupSize) {
      groups.push(seats.slice(i, i + groupSize));
    }
    return groups;
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
    <div className="w-full flex flex-col items-center">
      {/* Escenario */}
      {isMounted ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 w-full"
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
      ) : (
        <div className="mb-12 w-full">
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
        </div>
      )}

      {/* Mapa de asientos */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-8">
          {/* Nave Izquierda */}
          <div className="space-y-1 flex flex-col items-center">
            {rows.map((row, rowIndex) => {
              const leftNaveSeats = getLeftNaveSeats(row);
              const category = leftNaveSeats[0]?.category;
              
              if (isMounted) {
                return (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: rowIndex * 0.05 }}
                    className="flex items-center gap-1"
                  >
                  {/* Etiqueta de fila */}
                  <div className="w-8 text-center font-bold text-gray-700 text-sm">
                    {row}
                  </div>

                  {/* Asientos de nave izquierda */}
                  {leftNaveSeats.map((seat, seatIndex) => {
                    const isSelected = isSeatSelected(seat);
                    const status = isSelected ? 'selected' : seat.status;
                    const colorClass = categoryColors[seat.category][status];
                    const isClickable = seat.status === 'available' || isSelected;

                    return (
                      <motion.button
                        key={seat.id}
                        initial={isMounted ? { opacity: 0, scale: 0.8 } : false}
                        animate={isMounted ? { opacity: 1, scale: 1 } : false}
                        transition={isMounted ? { duration: 0.3, delay: rowIndex * 0.05 + seatIndex * 0.02 } : {}}
                        whileHover={isClickable ? { scale: 1.1 } : {}}
                        whileTap={isClickable ? { scale: 0.95 } : {}}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!isClickable}
                        className={`
                          w-8 h-8 rounded transition-all duration-200
                          flex items-center justify-center text-white text-xs font-semibold
                          ${colorClass}
                          ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                          shadow-sm hover:shadow-md
                        `}
                        title={`${row}${seat.number} - ${categoryLabels[seat.category]} - $${seat.price}`}
                      >
                        {seat.number}
                      </motion.button>
                    );
                  })}
                  </motion.div>
                );
              } else {
                return (
                  <div
                    key={row}
                    className="flex items-center gap-1"
                  >
                    {/* Etiqueta de fila */}
                    <div className="w-8 text-center font-bold text-gray-700 text-sm">
                      {row}
                    </div>

                    {/* Asientos de nave izquierda */}
                    {getLeftNaveSeats(row).map((seat) => {
                      const isSelected = isSeatSelected(seat);
                      const status = isSelected ? 'selected' : seat.status;
                      const colorClass = categoryColors[seat.category][status];
                      const isClickable = seat.status === 'available' || isSelected;

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={!isClickable}
                          className={`
                            w-8 h-8 rounded transition-all duration-200
                            flex items-center justify-center text-white text-xs font-semibold
                            ${colorClass}
                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                            shadow-sm hover:shadow-md
                          `}
                          title={`${row}${seat.number} - ${categoryLabels[seat.category]} - $${seat.price}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>

          {/* Pasillo Central */}
          <div className="w-20 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 font-semibold mb-2">PASILLO</div>
            <div className="w-px h-full bg-gray-300"></div>
          </div>

          {/* Nave Derecha */}
          <div className="space-y-1 flex flex-col items-center">
            {rows.map((row, rowIndex) => {
              const rightNaveSeats = getRightNaveSeats(row);
              const category = rightNaveSeats[0]?.category;
              
              if (isMounted) {
                return (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: rowIndex * 0.05 }}
                    className="flex items-center gap-1"
                  >
                  {/* Asientos de nave derecha */}
                  {rightNaveSeats.map((seat, seatIndex) => {
                    const isSelected = isSeatSelected(seat);
                    const status = isSelected ? 'selected' : seat.status;
                    const colorClass = categoryColors[seat.category][status];
                    const isClickable = seat.status === 'available' || isSelected;

                    return (
                      <motion.button
                        key={seat.id}
                        initial={isMounted ? { opacity: 0, scale: 0.8 } : false}
                        animate={isMounted ? { opacity: 1, scale: 1 } : false}
                        transition={isMounted ? { duration: 0.3, delay: rowIndex * 0.05 + (seatIndex + 12) * 0.02 } : {}}
                        whileHover={isClickable ? { scale: 1.1 } : {}}
                        whileTap={isClickable ? { scale: 0.95 } : {}}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!isClickable}
                        className={`
                          w-8 h-8 rounded transition-all duration-200
                          flex items-center justify-center text-white text-xs font-semibold
                          ${colorClass}
                          ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                          shadow-sm hover:shadow-md
                        `}
                        title={`${row}${seat.number} - ${categoryLabels[seat.category]} - $${seat.price}`}
                      >
                        {seat.number}
                      </motion.button>
                    );
                  })}

                  {/* Etiqueta de fila */}
                  <div className="w-8 text-center font-bold text-gray-700 text-sm ml-1">
                    {row}
                  </div>
                  </motion.div>
                );
              } else {
                return (
                  <div
                    key={row}
                    className="flex items-center gap-1"
                  >
                    {/* Asientos de nave derecha */}
                    {getRightNaveSeats(row).map((seat) => {
                      const isSelected = isSeatSelected(seat);
                      const status = isSelected ? 'selected' : seat.status;
                      const colorClass = categoryColors[seat.category][status];
                      const isClickable = seat.status === 'available' || isSelected;

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={!isClickable}
                          className={`
                            w-8 h-8 rounded transition-all duration-200
                            flex items-center justify-center text-white text-xs font-semibold
                            ${colorClass}
                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                            shadow-sm hover:shadow-md
                          `}
                          title={`${row}${seat.number} - ${categoryLabels[seat.category]} - $${seat.price}`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}

                    {/* Etiqueta de fila */}
                    <div className="w-8 text-center font-bold text-gray-700 text-sm ml-1">
                      {row}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

