# 🔍 Diagnóstico: Base de datos no se carga en Vercel

## 🚨 **Problema Identificado**
La base de datos funciona correctamente en **local** pero **falla en Vercel**.

## 📊 **Análisis del Problema**

### 🏠 **Local (Funciona)**
- ✅ Conexión directa a Supabase
- ✅ Variables de entorno desde `.env`
- ✅ Prisma Client funcional

### 🚀 **Vercel (Falla)**
- ❌ Posible falta de variables de entorno
- ❌ Configuración de región incorrecta
- ❌ Problemas de connection pooling
- ❌ Timeout de función

## 🔧 **Causas Más Probables**

### 1. **Variables de Entorno Faltantes en Vercel**
```bash
# Verificar que estas estén configuradas en Vercel:
DATABASE_URL="postgresql://postgres.nwdehgvrqtmljioxfxxj:..."
NEXTAUTH_URL="https://tu-dominio-vercel.app"
NEXTAUTH_SECRET="rXyzVb3wa6Y8vdaXJLmpPteRNxGixXeK"
RESEND_API_KEY="re_YhtNtaYq_9DhrTa8JRuUK6NQxmgruFn8V"
```

### 2. **Configuración de Región Incorrecta**
```json
// vercel.json - Región debe coincidir con Supabase
{
  "regions": ["cle1"]  // Cleveland - ¿coincide con sa-east-1?
}
```

### 3. **Connection Pooling de Supabase**
```typescript
// DATABASE_URL actual usa pooler:
"aws-0-sa-east-1.pooler.supabase.com:5432"

// Pero puede necesitar configuración específica
```

### 4. **Prisma Client en Producción**
```typescript
// lib/prisma.ts línea 21 - Problema potencial:
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// En producción NO reutiliza la instancia
```

## 🛠️ **Soluciones Recomendadas**

### **Solución 1: Mejorar Prisma para Producción**
```typescript
// lib/prisma.ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    transactionOptions: {
      timeout: 10000,
    },
    // Configuración específica para Vercel
    __internal: {
      engine: {
        endpoint: process.env.DATABASE_URL
      }
    }
  });

// CAMBIO CRÍTICO: Reutilizar en producción también
globalForPrisma.prisma = prisma;
```

### **Solución 2: Corregir Región de Vercel**
```json
// vercel.json - Usar región de Supabase
{
  "regions": ["iad1"], // Virginia (más cerca de sa-east-1)
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 512
    }
  }
}
```

### **Solución 3: Connection String Optimizada**
```bash
# Para Vercel, usar connection string con parámetros específicos:
DATABASE_URL="postgresql://postgres.nwdehgvrqtmljioxfxxj:241ACF1831CC91FF@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

### **Solución 4: Healthcheck API**
```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy', db: 'connected' });
  } catch (error) {
    return Response.json({ 
      status: 'error', 
      db: 'disconnected',
      error: error.message 
    }, { status: 500 });
  }
}
```

## 🔍 **Pasos de Debugging**

### **1. Verificar Variables en Vercel Dashboard**
```bash
vercel env ls
```

### **2. Probar Healthcheck**
```bash
curl https://tu-app.vercel.app/api/health
```

### **3. Revisar Logs de Vercel**
- Ir a Vercel Dashboard → Functions → Logs
- Buscar errores de conexión DB

### **4. Probar Connection String**
```bash
# Desde terminal local con URL de producción
VERCEL_DATABASE_URL="..." npx prisma db push
```

## 🎯 **Implementación Inmediata**

1. **Corregir Prisma Client** para reutilizar en producción
2. **Ajustar región** de Vercel a IAD1
3. **Verificar variables** de entorno en Vercel
4. **Crear healthcheck** API para monitoreo
5. **Optimizar connection string** con parámetros

## 📈 **Monitoreo**
- Healthcheck endpoint: `/api/health`
- Logs estructurados en todas las APIs
- Alertas de Vercel configuradas