'use client';

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e5e7eb',
      padding: '60px 40px 40px 40px',
      color: '#374151'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        
        {/* Información de contacto */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Contacto
          </h3>
          <div style={{ lineHeight: '1.8' }}>
            <p><strong>Email:</strong> danielasalazardanza@gmail.com</p>
            <p><strong>Teléfono:</strong> +584246727437</p>
            <p><strong>Dirección:</strong> Ave. Bolívar / Centro Comercial Oliva / Local B15 - Ciudad Ojeda - Venezuela</p>
          </div>
        </div>

        {/* Enlaces */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Enlaces
          </h3>
          <div style={{ lineHeight: '1.8' }}>
            <p><a href="/quienes-somos" style={{ color: '#6b7280', textDecoration: 'none' }}>Quiénes somos</a></p>
            <p><a href="/terminos" style={{ color: '#6b7280', textDecoration: 'none' }}>Términos y condiciones</a></p>
            <p><a href="/politicas" style={{ color: '#6b7280', textDecoration: 'none' }}>Políticas de privacidad</a></p>
          </div>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            Síguenos
          </h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a 
              href="https://facebook.com/danzar" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                backgroundColor: '#1877f2',
                borderRadius: '50%',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)');
                (e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.4)');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'scale(1) translateY(0)');
                (e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 119, 242, 0.3)');
              }}
            >
              <Facebook size={20} />
            </a>
            
            <a 
              href="https://instagram.com/danzar" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                borderRadius: '50%',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(225, 48, 108, 0.3)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)');
                (e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 48, 108, 0.4)');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'scale(1) translateY(0)');
                (e.currentTarget.style.boxShadow = '0 2px 8px rgba(225, 48, 108, 0.3)');
              }}
            >
              <Instagram size={20} />
            </a>
            
            <a 
              href="https://twitter.com/danzar" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                backgroundColor: '#1da1f2',
                borderRadius: '50%',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(29, 161, 242, 0.3)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)');
                (e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'scale(1) translateY(0)');
                (e.currentTarget.style.boxShadow = '0 2px 8px rgba(29, 161, 242, 0.3)');
              }}
            >
              <Twitter size={20} />
            </a>
            
            <a 
              href="https://youtube.com/danzar" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                backgroundColor: '#ff0000',
                borderRadius: '50%',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(255, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)');
                (e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.4)');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'scale(1) translateY(0)');
                (e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 0, 0, 0.3)');
              }}
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

      </div>
      
      {/* Copyright */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280'
      }}>
        <p>© 2025 DanZar. Todos los derechos reservados.</p>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Powered and designed by Freedom Labs</p>
      </div>
    </div>
  );
}
