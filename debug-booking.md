# 🔍 Diagnóstico: Reservas que fallan en Vercel pero funcionan en local

## 📊 Análisis del problema

### 🏠 **Local vs 🚀 Producción (Vercel)**

| Aspecto | Local | Vercel |
|---------|-------|--------|
| Base de datos | Conexión directa | Pool de conexiones |
| Variables de entorno | `.env.local` | Variables de Vercel |
| Timeout | Sin límite | 30 segundos (configurado) |
| Zona horaria | Sistema local | UTC |
| Logs | Consola local | Vercel Functions |

## 🚨 **Principales causas identificadas**

### 1. **Problemas de Zona Horaria**
```typescript
// ❌ PROBLEMÁTICO en Vercel (sensible a zona horaria)
const requestedDate = new Date(startDateTime);
const dayOfWeek = requestedDate.getDay();

// ✅ MEJOR PRÁCTICA
const requestedDate = new Date(startDateTime + 'Z'); // Forzar UTC
```

### 2. **Timeout de base de datos**
- **Configuración actual:** 30 segundos en `vercel.json`
- **Problema:** Consultas complejas pueden tardar más
- **Solución:** Optimizar queries y aumentar timeout

### 3. **Pool de conexiones de Prisma**
```typescript
// Problema: Conexiones no se liberan correctamente
const booking = await prisma.booking.create({...});
// Falta: await prisma.$disconnect();
```

### 4. **Variables de entorno**
Verificar que estas variables estén configuradas en Vercel:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Variables de email (Resend)

## 🛠️ **Soluciones recomendadas**

### 1. **Mejorar manejo de fechas**
```typescript
// En widget/tenant/[tenantId]/bookings/route.ts línea 86-96
const bookingDate = new Date(`${date}T00:00:00.000Z`); // Forzar UTC
const startDateTime = new Date(`${date}T${time}:00.000Z`);
```

### 2. **Agregar logs de debugging**
```typescript
console.log('Creating booking with data:', {
  startDateTime,
  endDateTime,
  serviceId,
  tenantId
});
```

### 3. **Mejorar manejo de errores**
```typescript
} catch (error) {
  console.error("Detailed error:", {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  return NextResponse.json(
    { error: `Error específico: ${error.message}` },
    { status: 500 }
  );
}
```

### 4. **Verificar configuración de Prisma**
```typescript
// En lib/prisma.ts - agregar configuración para producción
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  transactionOptions: {
    timeout: 10000, // 10 segundos
  },
  // Agregar para producción
  __internal: {
    engine: {
      endpoint: process.env.DATABASE_URL
    }
  }
});
```

## 🔧 **Pasos de debugging**

1. **Verificar logs en Vercel:**
   - Ir a Vercel Dashboard → Functions → Logs
   - Buscar errores en tiempo real

2. **Probar endpoints individualmente:**
   ```bash
   curl -X POST https://tu-app.vercel.app/api/widget/tenant/[id]/bookings \
     -H "Content-Type: application/json" \
     -d '{"serviceId":"test","date":"2024-01-01","time":"10:00",...}'
   ```

3. **Comparar variables de entorno:**
   ```bash
   vercel env ls
   ```

## 🎯 **Implementación inmediata**

1. Agregar logs detallados en APIs
2. Mejorar manejo de fechas UTC
3. Verificar variables de entorno en Vercel
4. Aumentar timeout si es necesario
5. Implementar retry logic para conexiones DB

## 📈 **Monitoreo**

- Configurar alertas en Vercel
- Implementar healthcheck endpoints
- Logs estructurados para debugging