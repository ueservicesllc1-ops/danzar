'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle } from 'lucide-react';

interface PaymentAlertButtonProps {
  count: number;
  month: string;
  onClick: () => void;
  className?: string;
}

const PaymentAlertButton: React.FC<PaymentAlertButtonProps> = ({
  count,
  month,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 1 }}
      animate={{
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 4px 6px rgba(0, 0, 0, 0.05)',
          '0 0 25px rgba(239, 68, 68, 0.4)',
          '0 4px 6px rgba(0, 0, 0, 0.05)'
        ]
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.5)',
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '2px solid #ef4444',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
    >
      {/* Efecto de pulso de fondo */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
          borderRadius: '12px',
          zIndex: 0
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Contenido del botón */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          style={{
            backgroundColor: '#fee2e2',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <CreditCard size={24} color="#dc2626" />
        </motion.div>
        
        <motion.h3
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '4px'
          }}
          animate={{
            color: ['#dc2626', '#ef4444', '#dc2626']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {count}
        </motion.h3>
        
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
          Pagos Pendientes
        </p>
        
        <motion.p
          style={{
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: '#fee2e2',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}
          animate={{
            backgroundColor: ['#fee2e2', '#fecaca', '#fee2e2']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <AlertTriangle size={12} style={{ marginRight: '4px' }} />
          {month}
        </motion.p>
      </div>
      
      {/* Indicador de notificación pulsante */}
      <motion.div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '12px',
          height: '12px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          zIndex: 2
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.3, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default PaymentAlertButton;
