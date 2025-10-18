'use client';

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
            <p><strong>Email:</strong> info@danzar.com</p>
            <p><strong>Teléfono:</strong> +1 (555) 123-4567</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Ciudad, País</p>
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
            <a href="https://facebook.com/danzar" style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: '#1877f2',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}>
              f
            </a>
            
            <a href="https://instagram.com/danzar" style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: '#e4405f',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}>
              📷
            </a>
            
            <a href="https://twitter.com/danzar" style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: '#1da1f2',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}>
              t
            </a>
            
            <a href="https://youtube.com/danzar" style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '40px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}>
              ▶
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
        <p>© 2024 DanZar. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
