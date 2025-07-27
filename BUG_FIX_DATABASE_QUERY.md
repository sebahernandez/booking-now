# 🐛 Bug Fix: "Failed to fetch" Error in useServiceAvailability

## 🔍 **Análisis del Problema**

El error "Failed to fetch" reportado por el usuario no era realmente un error de red, sino un bug en la API de disponibilidad de servicios que causaba que la funcionalidad no trabajara correctamente.

### Síntomas Observados

- Error "Failed to fetch" en `useServiceAvailability.useCallback[generateAvailableSlots]`
- El hook `fetchWithRetry` funcionaba correctamente (la API respondía)
- Los slots de tiempo mostraban `"available": false`
- Todos los slots tenían `"professionals": []` (array vacío)

### 🕵️ **Investigación**

1. **API Response**: La API `/api/widget/tenant/[tenantId]/services/[serviceId]/availability` respondía correctamente (HTTP 200)
2. **Database**: Los datos existían:
   - ✅ Tenants configurados correctamente
   - ✅ Services con availability schedules
   - ✅ Professionals asignados a services
3. **Query Issue**: El problema estaba en la consulta Prisma para obtener professionals

## 🔧 **Root Cause**

**Archivo**: `src/app/api/widget/tenant/[tenantId]/services/[serviceId]/availability/route.ts`

**Query Incorrecta**:

```typescript
const availableProfessionals = await prisma.professional.findMany({
  where: {
    tenantId: tenantId,
    services: {
      some: {
        id: serviceId, // ❌ INCORRECTO
      },
    },
  },
  // ...
});
```

**Problema**: El campo `id` no existe en el modelo `ProfessionalService`. La relación es:

- `Professional` -> `services` (ProfessionalService[])
- `ProfessionalService` tiene campo `serviceId`, no `id`

## ✅ **Solución Aplicada**

**Query Corregida**:

```typescript
const availableProfessionals = await prisma.professional.findMany({
  where: {
    tenantId: tenantId,
    services: {
      some: {
        serviceId: serviceId, // ✅ CORRECTO
      },
    },
  },
  // ...
});
```

## 🧪 **Validación del Fix**

### Antes del Fix

```json
{
  "time": "09:00",
  "available": false,
  "professionals": []
}
```

### Después del Fix

```json
{
  "time": "09:00",
  "available": true,
  "professionals": [
    {
      "id": "cmdf0rlvm000ecdwec5ifhinp",
      "user": { "name": "John Smith" }
    },
    {
      "id": "cmdf0rlvo000gcdwe9c41h7wx",
      "user": { "name": "Sarah Johnson" }
    }
  ]
}
```

## 📊 **Impacto**

### ✅ **Beneficios**

- **Funcionalidad Restaurada**: Los usuarios ahora pueden ver horarios disponibles
- **UX Mejorada**: Los profesionales aparecen correctamente en cada slot
- **Error Handling**: El sistema de retry ya implementado sigue funcionando para errores reales de red

### 🎯 **Areas Afectadas**

- **Time Selection**: Los slots ahora muestran disponibilidad real
- **Professional Selection**: Los usuarios pueden ver qué profesionales están disponibles
- **Booking Flow**: El flujo completo de reservas funciona correctamente

## 🚦 **Testing**

### API Endpoint Testing

```bash
# Comando de prueba
curl -s "http://localhost:3000/api/widget/tenant/cmdf0rlvb0000cdwe0bc1f158/services/cmdf0rlvd0002cdweugn1uqe1/availability?date=2025-07-28" | jq '.availability | .[0:3]'
```

### Database Validation

- ✅ Tenants: 5 tenants configurados
- ✅ Services: 3 services por tenant con availability schedules
- ✅ Professionals: 3 professionals por tenant con services asignados
- ✅ Professional-Service Relations: Correctamente configuradas

## 📝 **Lecciones Aprendidas**

1. **Debugging Network Errors**: No todos los "Failed to fetch" son errores de red
2. **Prisma Relations**: Importante entender las relaciones many-to-many con tablas intermedias
3. **API Response Validation**: Siempre validar la estructura de respuesta de la API
4. **Database Schema**: Revisar el schema cuando hay problemas con queries Prisma

## 🔄 **Update: Loop Infinito Resuelto**

**Problema Adicional Detectado**: Después del fix de la query, se detectó un **loop infinito** que causaba múltiples peticiones simultáneas.

### 🐛 **Root Cause del Loop**

En `useBookingWizard.ts`, los `useEffect` dependían del objeto completo `availability`:

```typescript
// ❌ PROBLEMA: availability como dependencia completa
useEffect(() => {
  // ...
}, [bookingData.bookingData.service, availability]); // availability se recrea constantemente
```

### ✅ **Solución Aplicada**

1. **En `useServiceAvailability.ts`**:
   - Agregado `useRef` para almacenar `serviceAvailability` sin causar re-renders
   - Cambiadas dependencias de `useCallback` para usar solo `[tenantId]`
   - Funciones ahora son **estables** y no se recrean innecesariamente

```typescript
// ✅ CORREGIDO: Funciones estables con useRef
const serviceAvailabilityRef = useRef<ServiceAvailability[]>([]);
serviceAvailabilityRef.current = serviceAvailability;

const generateAvailableSlots = useCallback(
  async (date: string, service: Service) => {
    // Usa serviceAvailabilityRef.current en lugar de serviceAvailability
    const dayAvailability = serviceAvailabilityRef.current.find(/*...*/);
  },
  [tenantId] // Solo tenantId como dependencia
);
```

2. **En `useBookingWizard.ts`**:
   - Removido `availability` completo de las dependencias de `useEffect`
   - Agregados comentarios para ESLint explicando por qué las funciones son estables

```typescript
// ✅ CORREGIDO: Solo dependencias esenciales
useEffect(() => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [bookingData.bookingData.service?.id]); // availability functions are stable
```

### 🎯 **Resultado**

- ✅ **Loop infinito eliminado**
- ✅ **Peticiones estables** - no más spam de requests
- ✅ **Funcionalidad intacta** - booking wizard funciona correctamente
- ✅ **Performance mejorada** - menos re-renders innecesarios

---
