'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

// Imágenes del carrusel
const heroImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Ballet Clásico',
    subtitle: 'Elegancia y precisión',
    description: 'Descubre la belleza del ballet clásico con nuestros maestros profesionales'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Salsa',
    subtitle: 'Pasión caribeña',
    description: 'Aprende los ritmos más calientes de Latinoamérica'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Hip Hop',
    subtitle: 'Cultura urbana',
    description: 'Expresa tu creatividad con los movimientos más modernos'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Flamenco',
    subtitle: 'Arte español',
    description: 'Sumérgete en la pasión del flamenco auténtico'
  }
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play del carrusel
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="relative h-[80vh] overflow-hidden">
        {/* Carrusel de imágenes */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${heroImages[currentIndex].src})`,
                  filter: 'brightness(0.6)'
                }}
              />
              {/* Overlay con gradiente animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Logo centrado */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.img 
              src="/images/logo.png" 
              alt="DanZar Logo" 
              className="h-48 sm:h-60 lg:h-72 object-contain cursor-pointer hover:scale-110 hover:brightness-110 transition-all duration-300 ease-out"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut",
                delay: 0.8
              }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
              }}
            />
          </div>

          {/* Botones */}
          <div className="absolute bottom-68 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold w-48"
              >
                Ver Clases
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 text-lg font-semibold w-48"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Ver Galería
              </Button>
            </div>
          </div>

          {/* Controles del carrusel */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-4">
              {/* Botón anterior */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                onMouseEnter={() => setIsPlaying(false)}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </motion.button>
              
              {/* Indicadores */}
              <div className="flex space-x-2">
                {heroImages.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => goToSlide(index)}
                    onMouseEnter={() => setIsPlaying(false)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              
              {/* Botón siguiente */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                onMouseEnter={() => setIsPlaying(false)}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Botón play/pause */}
          <div className="absolute top-8 right-8 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Información de la imagen actual */}
          <motion.div
            key={`info-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-8 right-8 z-20"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-white max-w-xs border border-white/20">
              <h3 className="font-semibold text-lg mb-1">
                {heroImages[currentIndex].title}
              </h3>
              <p className="text-sm text-gray-200">
                {heroImages[currentIndex].description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-sm"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-40 right-20 w-16 h-16 bg-accent/20 rounded-full blur-sm"
          />
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 8, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-40 left-20 w-24 h-24 bg-primary/10 rounded-full blur-sm"
          />
        </div>
      </div>

    </>
  );
}
