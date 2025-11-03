'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Seat, SeatStatus, SeatCategory } from '@/types/events';
import { Monitor, ZoomIn, ZoomOut, X } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const rows = Array.from(new Set(seats.map(seat => seat.row))).sort();
  
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Actualizar refs cuando cambian los estados
  useEffect(() => {
    scaleRef.current = scale;
    positionRef.current = position;
  }, [scale, position]);

  // Manejo de zoom con dos dedos (pinch to zoom) - Versión mejorada
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let initialDistance = 0;
    let initialScale = 1;
    let initialPosition = { x: 0, y: 0 };
    let lastTouch: { x: number; y: number } | null = null;
    let isPinching = false;
    let isPanning = false;

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touch1: Touch, touch2: Touch) => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      const currentScale = scaleRef.current;
      const currentPosition = positionRef.current;
      
      if (e.touches.length === 2) {
        isPinching = true;
        isPanning = false;
        setIsZooming(true);
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = currentScale;
        const center = getCenter(e.touches[0], e.touches[1]);
        const rect = container.getBoundingClientRect();
        const containerCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        initialPosition = {
          x: currentPosition.x + (center.x - containerCenter.x) / currentScale,
          y: currentPosition.y + (center.y - containerCenter.y) / currentScale
        };
        e.preventDefault();
        e.stopPropagation();
      } else if (e.touches.length === 1 && currentScale > 1) {
        isPanning = true;
        isPinching = false;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPosition = currentPosition;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleRatio = currentDistance / initialDistance;
        const newScale = Math.max(0.8, Math.min(4, initialScale * scaleRatio));
        
        const center = getCenter(e.touches[0], e.touches[1]);
        const rect = container.getBoundingClientRect();
        const containerCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        // Ajustar posición para mantener el centro del zoom
        const newX = initialPosition.x - (center.x - containerCenter.x) / newScale;
        const newY = initialPosition.y - (center.y - containerCenter.y) / newScale;
        
        // Limitar el pan para que no se salga mucho
        const maxPan = 250;
        const newPosition = {
          x: Math.max(-maxPan, Math.min(maxPan, newX)),
          y: Math.max(-maxPan, Math.min(maxPan, newY))
        };
        
        scaleRef.current = newScale;
        positionRef.current = newPosition;
        setScale(newScale);
        setPosition(newPosition);
        e.preventDefault();
        e.stopPropagation();
      } else if (e.touches.length === 1 && isPanning && lastTouch) {
        const currentScale = scaleRef.current;
        const deltaX = e.touches[0].clientX - lastTouch.x;
        const deltaY = e.touches[0].clientY - lastTouch.y;
        
        const maxPan = 250;
        const newX = initialPosition.x + deltaX / currentScale;
        const newY = initialPosition.y + deltaY / currentScale;
        
        const newPosition = {
          x: Math.max(-maxPan, Math.min(maxPan, newX)),
          y: Math.max(-maxPan, Math.min(maxPan, newY))
        };
        
        positionRef.current = newPosition;
        setPosition(newPosition);
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const currentScale = scaleRef.current;
      const currentPosition = positionRef.current;
      
      if (e.touches.length === 0) {
        isPinching = false;
        isPanning = false;
        setIsZooming(false);
        lastTouch = null;
        
        // Resetear zoom si es muy pequeño
        if (currentScale < 0.9) {
          scaleRef.current = 1;
          positionRef.current = { x: 0, y: 0 };
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      } else if (e.touches.length === 1) {
        // Si queda un dedo después de un pinch, activar pan
        isPinching = false;
        isPanning = true;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPosition = currentPosition;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isMobile]);
  
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
        {/* Botón Reset Zoom solo en móvil cuando hay zoom */}
        {isMobile && scale > 1.05 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="sm:hidden fixed bottom-20 right-4 z-50 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all"
            style={{ width: '52px', height: '52px' }}
            whileTap={{ scale: 0.9 }}
          >
            <ZoomOut className="w-6 h-6" />
          </motion.button>
        )}
        
        {/* Instrucción para zoom en móvil */}
        {isMobile && scale <= 1.05 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sm:hidden text-xs text-gray-500 text-center px-4 mb-2"
          >
            👆 Usa dos dedos para hacer zoom y moverte por el mapa
          </motion.p>
        )}
        
        {/* Vista de asientos con zoom táctil */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden"
          style={{
            touchAction: isMobile ? 'none' : 'auto',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <div
            className="flex items-center gap-0.5 sm:gap-4 lg:gap-8 origin-center"
            style={{
              transform: isMobile 
                ? `translate(${position.x}px, ${position.y}px) scale(${scale})`
                : 'none',
              transformOrigin: 'center center',
              transition: isMobile && !isZooming ? 'transform 0.15s ease-out' : 'none',
              willChange: isMobile ? 'transform' : 'auto'
            }}
          >
          {/* Nave Izquierda */}
          <div className="space-y-0.5 sm:space-y-1 flex flex-col items-center">
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
                    className="flex items-center gap-0.5 sm:gap-1"
                  >
                  {/* Etiqueta de fila */}
                  <div className="w-3 sm:w-8 text-center font-bold text-gray-700 text-[7px] sm:text-sm">
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
                          w-3 h-3 sm:w-8 sm:h-8 rounded transition-all duration-200
                          flex items-center justify-center text-white text-[7px] sm:text-xs font-semibold
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
                    className="flex items-center gap-0.5 sm:gap-1"
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
                            w-3 h-3 sm:w-8 sm:h-8 rounded transition-all duration-200
                            flex items-center justify-center text-white text-[7px] sm:text-xs font-semibold
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
          <div className="w-2 sm:w-12 lg:w-20 flex flex-col items-center justify-center">
            <div className="text-[8px] sm:text-xs text-gray-400 font-semibold mb-0.5 sm:mb-2 hidden sm:block">PASILLO</div>
            <div className="w-px h-full bg-gray-300"></div>
          </div>

          {/* Nave Derecha */}
          <div className="space-y-0.5 sm:space-y-1 flex flex-col items-center">
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
                    className="flex items-center gap-0.5 sm:gap-1"
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
                          w-3 h-3 sm:w-8 sm:h-8 rounded transition-all duration-200
                          flex items-center justify-center text-white text-[7px] sm:text-xs font-semibold
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
                  <div className="w-3 sm:w-8 text-center font-bold text-gray-700 text-[7px] sm:text-sm ml-1">
                    {row}
                  </div>
                  </motion.div>
                );
              } else {
                return (
                  <div
                    key={row}
                    className="flex items-center gap-0.5 sm:gap-1"
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
                            w-3 h-3 sm:w-8 sm:h-8 rounded transition-all duration-200
                            flex items-center justify-center text-white text-[7px] sm:text-xs font-semibold
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

    </div>
  );
}

