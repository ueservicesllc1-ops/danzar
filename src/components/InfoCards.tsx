'use client';

import { motion } from 'framer-motion';
import { Clock, Music, DollarSign, Users, Phone } from 'lucide-react';

const infoCards = [
  {
    id: 1,
    icon: Clock,
    title: "Horarios",
    description: "Clases disponibles en horarios flexibles",
    details: [
      { label: "Lunes a Viernes", value: "9:00 AM - 12:00 PM" },
      { label: "", value: "4:00 PM - 8:00 PM" },
      { label: "Sábados", value: "9:00 AM - 2:00 PM" }
    ],
    color: "blue"
  },
  {
    id: 2,
    icon: Music,
    title: "Estilos",
    description: "Diversidad de géneros de danza",
    details: [
      { label: "", value: "Ballet Clásico" },
      { label: "", value: "Salsa" },
      { label: "", value: "Hip Hop" },
      { label: "", value: "Flamenco" },
      { label: "", value: "Contemporáneo" }
    ],
    color: "purple"
  },
  {
    id: 3,
    icon: DollarSign,
    title: "Precios",
    description: "Planes accesibles para todos",
    details: [
      { label: "Individual", value: "$25/hora" },
      { label: "Mensual", value: "$80/mes" },
      { label: "Trimestral", value: "$200" }
    ],
    color: "green"
  },
  {
    id: 4,
    icon: Users,
    title: "Niveles",
    description: "Clases adaptadas a tu nivel",
    details: [
      { label: "Principiantes", value: "Lun y Mié" },
      { label: "Intermedio", value: "Mar y Jue" },
      { label: "Avanzado", value: "Vie y Sáb" }
    ],
    color: "orange"
  },
  {
    id: 5,
    icon: Phone,
    title: "Contacto",
    description: "Estamos aquí para ayudarte",
    details: [
      { label: "Teléfono", value: "+1 (555) 123-4567" },
      { label: "Email", value: "info@danzar.com" },
      { label: "Dirección", value: "Calle Danza 123" }
    ],
    color: "pink"
  }
];

const colorVariants = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    icon: "text-blue-600",
    accent: "bg-blue-500"
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    icon: "text-purple-600",
    accent: "bg-purple-500"
  },
  green: {
    bg: "from-green-50 to-green-100",
    border: "border-green-200",
    icon: "text-green-600",
    accent: "bg-green-500"
  },
  orange: {
    bg: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    icon: "text-orange-600",
    accent: "bg-orange-500"
  },
  pink: {
    bg: "from-pink-50 to-pink-100",
    border: "border-pink-200",
    icon: "text-pink-600",
    accent: "bg-pink-500"
  }
};

export default function InfoCards() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-5xl font-light text-gray-900 mb-6 tracking-tight"
          >
            Academia <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">DanZar</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-24 h-px bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Descubre el arte de la danza con nuestros profesionales y sumérgete en un mundo de movimiento y expresión artística
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {infoCards.map((card, index) => {
            const colors = colorVariants[card.color as keyof typeof colorVariants];
            const IconComponent = card.icon;
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="group perspective-1000"
              >
                <div className={`
                  relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 
                  shadow-xl hover:shadow-2xl transition-all duration-500 
                  border ${colors.border} group-hover:bg-white/95 
                  group-hover:-translate-y-3 h-full overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-br 
                  before:${colors.bg} before:opacity-0 before:group-hover:opacity-100 
                  before:transition-opacity before:duration-500 before:-z-10
                `}>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center mb-6"
                  >
                    <div className={`
                      w-16 h-16 ${colors.accent} rounded-2xl flex items-center 
                      justify-center mx-auto mb-4 group-hover:scale-110 
                      transition-transform duration-300 shadow-lg
                    `}>
                      <IconComponent className={`w-8 h-8 text-white`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-wide">
                      {card.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      {card.description}
                    </p>
                    
                    {/* Details */}
                    <div className="space-y-3">
                      {card.details.map((detail, detailIndex) => (
                        <motion.div
                          key={detailIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.1 + 0.3 + detailIndex * 0.1 
                          }}
                          viewport={{ once: true }}
                          className="text-left"
                        >
                          {detail.label && (
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                              {detail.label}
                            </p>
                          )}
                          <p className="text-sm font-medium text-gray-700">
                            {detail.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-gray-200 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-gray-300 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

