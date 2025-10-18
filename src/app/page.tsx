'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Award, Heart, Music, Zap, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomePage = () => {

  // Datos del carrusel de banners
  const banners = [
    {
      id: 1,
      title: "Descubre tu Pasión",
      subtitle: "Donde cada movimiento cuenta una historia",
      description: "Únete a nuestra familia de bailarines y descubre el arte que llevas dentro",
      image: "/images/logo.png",
      bgGradient: "from-purple-600 via-pink-600 to-red-500",
      textColor: "text-white"
    },
    {
      id: 2,
      title: "Clases para Todos",
      subtitle: "Desde principiantes hasta profesionales",
      description: "Nuestros instructores expertos te guiarán en tu viaje de danza",
      image: "/images/logo.png",
      bgGradient: "from-blue-600 via-cyan-500 to-teal-400",
      textColor: "text-white"
    },
    {
      id: 3,
      title: "Comunidad Unida",
      subtitle: "Más que una academia, somos familia",
      description: "Conecta con otros bailarines y crea amistades que durarán toda la vida",
      image: "/images/logo.png",
      bgGradient: "from-orange-500 via-red-500 to-pink-500",
      textColor: "text-white"
    }
  ];

  // Estadísticas animadas
  const stats = [
    { number: "500+", label: "Estudiantes Felices", icon: Users },
    { number: "15+", label: "Años de Experiencia", icon: Award },
    { number: "50+", label: "Clases por Semana", icon: Music },
    { number: "100%", label: "Pasión Garantizada", icon: Heart }
  ];

  // Características principales
  const features = [
    {
      icon: Star,
      title: "Instructores Certificados",
      description: "Profesionales con años de experiencia y certificaciones internacionales",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "Grupos Pequeños",
      description: "Atención personalizada con máximo 12 estudiantes por clase",
      color: "text-blue-500"
    },
    {
      icon: Music,
      title: "Múltiples Estilos",
      description: "Salsa, Bachata, Merengue, Reggaeton, Hip-Hop y más",
      color: "text-purple-500"
    },
    {
      icon: Award,
      title: "Certificaciones",
      description: "Recibe certificados oficiales al completar cada nivel",
      color: "text-green-500"
    }
  ];

  // Testimonios
  const testimonials = [
    {
      name: "María González",
      role: "Estudiante Avanzada",
      content: "DanZar cambió mi vida. No solo aprendí a bailar, sino que encontré una familia increíble.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Padre de Familia",
      content: "Mis hijos han crecido tanto aquí. Los instructores son excepcionales y muy pacientes.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Profesional",
      content: "Después de 2 años aquí, puedo decir que es la mejor academia de danza de la ciudad.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section con Carrusel */}
      <section className="relative min-h-screen overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          loop={true}
          className="h-screen"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.id}>
              <div className={`relative h-screen bg-gradient-to-br ${banner.bgGradient} flex items-center justify-center`}>
                {/* Overlay para mejor legibilidad */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Contenido del banner */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Logo */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="flex justify-center mb-8"
                    >
                      <Image
                        src={banner.image}
                        alt="DanZar Logo"
                        width={300}
                        height={300}
                        className="object-contain drop-shadow-2xl"
                      />
                    </motion.div>

                    {/* Título principal */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className={`text-5xl md:text-7xl font-bold ${banner.textColor} mb-4`}
                    >
                      {banner.title}
                    </motion.h1>

                    {/* Subtítulo */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className={`text-2xl md:text-3xl font-semibold ${banner.textColor} mb-6`}
                    >
                      {banner.subtitle}
                    </motion.h2>

                    {/* Descripción */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className={`text-lg md:text-xl ${banner.textColor} mb-8 max-w-3xl mx-auto`}
                    >
                      {banner.description}
                    </motion.p>

                    {/* Botón CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <Link href="/gallery">
                        <Button 
                          size="lg" 
                          className="bg-white text-gray-900 hover:bg-gray-100 text-xl px-12 py-6 font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Play className="mr-3 h-6 w-6" />
                          Explorar Ahora
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Elementos decorativos animados */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Estadísticas Animadas */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Números que Hablan
            </h2>
            <p className="text-xl text-gray-300">
              La confianza de nuestra comunidad se refleja en estos números
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                  <stat.icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                  >
                    {stat.number}
                  </motion.div>
                  <p className="text-gray-300 font-semibold">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir DanZar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos más que una academia de danza, somos una familia que comparte la pasión por el arte del movimiento.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros estudiantes
            </h2>
            <p className="text-xl text-gray-600">
              Historias reales de transformación y crecimiento
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              ¿Listo para comenzar tu viaje?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a nuestra comunidad y descubre el bailarín que llevas dentro. 
              Tu historia de danza comienza aquí.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/gallery">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-10 py-6 font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                >
                  <Zap className="mr-3 h-6 w-6" />
                  Explorar Galería
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-xl px-10 py-6 font-bold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="mr-3 h-6 w-6" />
                  Únete Ahora
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;