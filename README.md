# DanZar - Academia de Danza 🕺💃

Una aplicación web moderna y elegante para la academia de danza DanZar, construida con Next.js, TypeScript, Tailwind CSS y Firebase.

## ✨ Características

- **🎨 Diseño Moderno**: Paleta oscura elegante con morado eléctrico como color primario
- **📱 Responsive**: Optimizado para desktop, tablet y móvil
- **⚡ Animaciones Suaves**: Framer Motion para transiciones fluidas
- **🔐 Autenticación**: Sistema de login/registro con Firebase Auth
- **📊 Dashboard**: Panel de usuario con estadísticas y clases
- **💳 Pagos**: Gestión de pagos y subida de comprobantes
- **🖼️ Galería**: Galería con scroll infinito y filtros
- **🌙 Dark Mode**: Tema oscuro por defecto con efectos glass

## 🚀 Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + ShadCN UI
- **Animaciones**: Framer Motion
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Almacenamiento**: Firebase Storage
- **Iconos**: Lucide React

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd danzar
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Edita `.env.local` con tu configuración de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Configura Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication con Email/Password
   - Crea una base de datos Firestore
   - Configura Storage para archivos

5. **Ejecuta el proyecto**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard del usuario
│   ├── gallery/           # Galería de fotos/videos
│   ├── payments/          # Gestión de pagos
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de ShadCN UI
│   ├── layout/           # Navbar, Footer, etc.
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── gallery/          # Componentes de la galería
│   └── payments/         # Componentes de pagos
├── contexts/             # Contextos de React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── types/                # Definiciones de TypeScript
└── ...
```

## 🎨 Paleta de Colores

- **Fondo**: Negro (#000000)
- **Primario**: Morado eléctrico (#7c3aed)
- **Secundario**: Gris oscuro (#1f2937)
- **Acento**: Amarillo (#facc15)
- **Texto**: Blanco y grises

## 📱 Páginas Principales

### 🏠 Home/Landing Page
- Hero section con animaciones
- Sección de características
- Clases destacadas
- Call-to-action

### 🔐 Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Validación de formularios
- Recuperación de contraseña

### 📊 Dashboard
- Estadísticas del usuario
- Próximas clases
- Progreso de aprendizaje
- Acciones rápidas

### 💳 Pagos
- Historial de pagos
- Subida de comprobantes
- Estados de pago
- Descarga de recibos

### 🖼️ Galería
- Grid responsivo de fotos/videos
- Filtros por tipo y categoría
- Scroll infinito
- Modal de vista detallada

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
```

## 🔧 Configuración Adicional

### Firebase Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    match /gallery/{galleryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otras plataformas
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: info@danzar.com
- 💬 Discord: [Servidor de DanZar](https://discord.gg/danzar)
- 📖 Documentación: [Wiki del proyecto](https://github.com/tu-usuario/danzar/wiki)

---

**¡Disfruta bailando con DanZar! 🕺💃**