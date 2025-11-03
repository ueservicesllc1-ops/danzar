'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import Link from 'next/link';

// Imágenes del carrusel - Academia de Danza para Niñas (chicas practicando ballet)
const heroImages = [
  {
    id: 1,
    src: '/images/bannerhero.jpg',
    title: 'Ballet Clásico',
    subtitle: 'Formación profesional',
    description: 'Desarrolla elegancia, disciplina y técnica con nuestras clases de ballet para niñas'
  },
  {
    id: 2,
    src: '/images/bannerhero.jpg',
    title: 'Academia de Danza',
    subtitle: 'Para niñas y jóvenes',
    description: 'Un espacio dedicado al crecimiento artístico y personal de nuestras bailarinas'
  },
  {
    id: 3,
    src: '/images/bannerhero.jpg',
    title: 'Ballet Infantil',
    subtitle: 'Desde temprana edad',
    description: 'Inicia a tu hija en el mundo del ballet con métodos pedagógicos apropiados'
  },
  {
    id: 4,
    src: '/images/bannerhero.jpg',
    title: 'Preparación Artística',
    subtitle: 'Excelencia en danza',
    description: 'Programas de formación integral para niñas que aspiran a la excelencia en ballet'
  },
  {
    id: 5,
    src: '/images/bannerhero.jpg',
    title: 'Técnica Clásica',
    subtitle: 'Fundamentos sólidos',
    description: 'Maestros certificados guían a nuestras estudiantes en cada paso de su desarrollo'
  }
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeroPopup, setShowHeroPopup] = useState(false);

  // Mostrar popup hero al cargar la página (cada vez que se carga la página)
  useEffect(() => {
    // Esperar a que el componente esté montado en el cliente
    if (typeof window === 'undefined') return;
    
    // Mostrar popup después de 2 segundos cada vez que se carga la página
    const timer = setTimeout(() => {
      setShowHeroPopup(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleAcquireTicket = () => {
    setShowHeroPopup(false);
  };

  return (
    <>
      {/* Popup Hero */}
      <AnimatePresence>
        {showHeroPopup && (
          <>
            {/* Overlay - No se cierra al hacer clic */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
            />
            {/* Popup Content */}
            <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none z-[10000]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="pointer-events-auto relative w-full h-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
              >
                {/* Botón cerrar */}
                <button
                  onClick={() => setShowHeroPopup(false)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Contenedor principal del popup */}
                <div className="relative flex-1 flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden min-h-0">
                  {/* Imagen Flyer */}
                  <div className="flex-1 overflow-auto relative">
                    <img
                      src="/images/flyer.jpg"
                      alt="Flyer DanZar"
                      className="w-full h-full object-contain sm:object-cover"
                    />
                  </div>
                  
                  {/* Botón "Compra tu Entrada Aquí" - Sobre la imagen, más abajo */}
                  <div className="absolute top-24 sm:top-32 left-0 right-0 z-[100] px-4 sm:px-6">
                    <div className="flex justify-center w-full">
                      <Link href="/eventos" onClick={handleAcquireTicket} className="block w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg shadow-xl transition-all duration-300 whitespace-nowrap"
                          style={{
                            boxShadow: '0 10px 25px rgba(147, 51, 234, 0.5)'
                          }}
                        >
                          Compra tu Entrada Aquí
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="relative h-[50vh] overflow-hidden">
        {/* Carrusel de imágenes */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${heroImages[currentIndex].src})`
                }}
              />
            </motion.div>
          </AnimatePresence>

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
                <ChevronLeft className="w-6 h-6" />
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
                <ChevronRight className="w-6 h-6" />
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
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
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
