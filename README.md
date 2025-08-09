# 📅 Booking Now - Sistema de Reservas Moderno

**Booking Now** es un sistema completo de gestión de reservas y citas construido con tecnologías modernas. Permite a los negocios gestionar servicios, profesionales y reservas a través de una interfaz intuitiva y un widget embebible.

## ✨ Características Principales

### 🎯 **Sistema Multi-Tenant**
- Soporte para múltiples empresas/tenants en una sola aplicación
- Aislamiento completo de datos entre tenants
- Panel de administración independiente para cada tenant

### 🧙‍♂️ **Wizard de Reservas Intuitivo**
- Proceso paso a paso para crear reservas
- Selección de servicio → Calendario → Horario → Profesional → Datos del cliente
- Validación en tiempo real de disponibilidad
- Interfaz responsive y accesible

### 👥 **Gestión de Roles**
- **ADMIN**: Administradores del sistema
- **TENANT**: Propietarios de negocios
- **PROFESSIONAL**: Prestadores de servicios
- **CLIENT**: Clientes que realizan reservas

### 🔧 **Panel de Administración**
- Gestión completa de servicios y precios
- Administración de profesionales y sus horarios
- Vista de calendario con todas las reservas
- Configuración de disponibilidad por servicio
- Sistema de notificaciones en tiempo real
- Estadísticas y reportes

### 🌐 **Widget Embebible**
- Widget JavaScript para integrar en cualquier sitio web
- Personalizable y responsive
- API REST para integraciones personalizadas

### 📧 **Sistema de Notificaciones**
- Notificaciones por email automáticas
- Confirmaciones de reserva para clientes y administradores
- Sistema de notificaciones en tiempo real
- Integración con Resend para envío de emails

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de CSS utilitario
- **ShadCN UI** - Componentes modernos y accesibles
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **Lucide React** - Iconografía moderna

### **Backend**
- **Next.js API Routes** - Backend serverless
- **Prisma ORM** - Gestión de base de datos
- **NextAuth.js** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **Resend** - Servicio de envío de emails

### **Base de Datos**
- **PostgreSQL** - Base de datos principal (desarrollo y producción)
- Migraciones automáticas con Prisma

### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **TypeScript** - Verificación de tipos
- **Turbopack** - Bundler ultra-rápido

## 📊 Modelo de Datos

### **Entidades Principales**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Tenant    │────│    User     │────│ Professional│
│             │    │             │    │             │
│ - name      │    │ - email     │    │ - bio       │
│ - email     │    │ - name      │    │ - hourlyRate│
│ - password  │    │ - role      │    │ - isAvailable│
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Service   │    │   Booking   │    │Availability │
│             │    │             │    │   Slot      │
│ - name      │    │ - startTime │    │             │
│ - duration  │    │ - endTime   │    │ - dayOfWeek │
│ - price     │    │ - status    │    │ - startTime │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Estados de Reserva**
- `PENDING` - Pendiente de confirmación
- `CONFIRMED` - Confirmada
- `CANCELLED` - Cancelada
- `COMPLETED` - Completada
- `NO_SHOW` - No se presentó

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18 o superior
- npm, yarn, pnpm o bun
- Git
- PostgreSQL (opcional para desarrollo local)

### **Instalación Local**

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd booking-now
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   # o
   bun install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus configuraciones
   ```

4. **Configurar la base de datos**
   ```bash
   # Ejecutar migraciones
   npm run db:migrate
   
   # Poblar con datos de ejemplo
   npm run db:seed
   ```

5. **Crear usuario administrador**
   ```bash
   npm run create-admin
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   # o
   bun dev
   ```

7. **Abrir en el navegador**
   - Aplicación: [http://localhost:3000](http://localhost:3000)
   - Panel Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Panel Tenant: [http://localhost:3000/tenant](http://localhost:3000/tenant)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Verificar código con ESLint

# Base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:generate  # Generar cliente Prisma
npm run db:seed      # Poblar base de datos

# Utilidades
npm run create-admin           # Crear usuario administrador
npm run clean-duplicates       # Limpiar registros duplicados
npm run seed-availability      # Poblar disponibilidad de servicios
```

## 🎯 Uso del Sistema

### **Para Administradores del Sistema**
1. Acceder a `/admin`
2. Gestionar tenants y configuración global
3. Monitorear el sistema

### **Para Propietarios de Negocios (Tenants)**
1. Acceder a `/tenant`
2. Configurar servicios y precios
3. Gestionar profesionales
4. Ver y administrar reservas
5. Configurar horarios de disponibilidad
6. Gestionar notificaciones

### **Para Clientes**
1. Acceder al widget de reservas
2. Seleccionar servicio deseado
3. Elegir fecha y hora disponible
4. Seleccionar profesional
5. Completar datos de contacto
6. Confirmar reserva

## 🔗 Widget de Reservas

Para integrar el widget en tu sitio web:

```html
<iframe 
  src="https://tu-dominio.com/widget/[TENANT_ID]" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

## 🌐 API REST

El sistema expone una API REST para integraciones personalizadas:

```bash
# Obtener servicios disponibles
GET /api/services?tenantId=[TENANT_ID]

# Obtener horarios disponibles
GET /api/availability?serviceId=[SERVICE_ID]&date=[DATE]

# Crear reserva
POST /api/bookings

# Gestionar notificaciones
GET /api/tenant/notifications
POST /api/tenant/notifications/mark-all-read
```

## 🔒 Seguridad

- Autenticación basada en JWT con NextAuth.js
- Encriptación de contraseñas con bcrypt
- Middleware de autorización por roles
- Validación de datos con Zod
- Protección CSRF integrada
- Aislamiento de datos por tenant

## 📱 Responsive Design

- Diseño completamente responsive
- Optimizado para móviles, tablets y desktop
- Interfaz táctil amigable
- Carga rápida y optimizada

## 🚀 Despliegue

### **Vercel (Recomendado)**

1. **Configurar base de datos PostgreSQL**
   ```bash
   # Usar Vercel Postgres o cualquier proveedor
   DATABASE_URL=postgresql://...
   ```

2. **Desplegar**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Ejecutar migraciones**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### **Variables de Entorno**

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
RESEND_API_KEY=your-resend-api-key
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en GitHub
- Revisar la documentación del código

---

**Desarrollado con ❤️ usando Next.js y tecnologías modernas**