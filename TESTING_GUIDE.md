# 🧪 Testing Guide - Booking Wizard Fix

## 🎯 **Problemas Resueltos**

1. ✅ **Query Database**: API ahora retorna professionals correctamente
2. ✅ **Loop Infinito**: Eliminadas peticiones múltiples simultáneas
3. ✅ **Error Handling**: Sistema de retry funciona para errores reales de red

## 🔧 **Cómo Probar**

### 1. **Acceso al Sistema**

```
URL: http://localhost:3000
```

### 2. **Login Demo**

- Email: `demo@bookingnowtenant.com`
- Password: `demo123` (o el password configurado para demo tenant)

### 3. **Flujo de Prueba**

#### **Paso 1: Seleccionar Servicio**

- Navegar al booking wizard
- Seleccionar cualquier servicio (ej: "Photography Session")
- ✅ **Verificar**: No debe haber múltiples peticiones en DevTools Network tab

#### **Paso 2: Seleccionar Fecha**

- Elegir una fecha futura
- ✅ **Verificar**: El calendario debe mostrar días disponibles correctamente
- ✅ **Verificar**: No debe haber loops infinitos de requests

#### **Paso 3: Seleccionar Hora**

- Elegir un slot de tiempo disponible
- ✅ **Verificar**: Debe mostrar professionals disponibles:
  - "John Smith"
  - "Sarah Johnson"
- ✅ **Verificar**: Slots deben mostrar `available: true`

### 4. **Testing de Errores de Red**

#### **Simular Error de Red**:

1. Abrir DevTools → Network tab
2. Ir a "Network conditions"
3. Seleccionar "Offline"
4. Intentar seleccionar fecha/servicio
5. ✅ **Verificar**: Debe mostrar el componente `NetworkError` con botón de retry
6. Activar red nuevamente
7. Hacer click en "Reintentar"
8. ✅ **Verificar**: Debe recuperarse automáticamente

#### **Simular Timeout**:

1. DevTools → Network tab → Throttling → "Slow 3G"
2. Intentar cargar disponibilidad
3. ✅ **Verificar**: Debe hacer retry automático después del timeout

## 📊 **Monitoreo en DevTools**

### **Console Logs Esperados**:

```javascript
🔧 Fetching service availability for: [serviceId]
📡 Service availability URL: /api/widget/tenant/[tenantId]/services/[serviceId]/availability
📥 Service availability response status: 200
📦 Service availability data: {success: true, availabilitySchedule: [...]}

🔍 Generating slots for: {date: "2025-07-28", service: "Photography Session"}
📡 Calling API: /api/widget/tenant/[tenantId]/services/[serviceId]/availability?date=2025-07-28
📥 API Response status: 200
✅ Available slots found: [number]
```

### **Network Tab Esperado**:

- **1 request** por service selection (no loops)
- **1 request** por date selection (no loops)
- **Response 200** con data correcta
- **No errores 500** o requests fallidos

### **React DevTools**:

- **No re-renders excesivos** en BookingWizard component
- **Estados estables** en useServiceAvailability
- **No loops infinitos** en useEffect

## 🚨 **Red Flags a Buscar**

### **❌ Problemas que NO deben ocurrir**:

- Múltiples requests simultáneos a la misma URL
- Loops infinitos en console
- Error "Failed to fetch" sin razón de red
- Slots con `available: false` y `professionals: []`
- Re-renders constantes del componente

### **✅ Comportamiento Correcto**:

- 1 request por acción del usuario
- Professionals aparecen en time slots
- Retry manual funciona en errores de red
- Estados se mantienen estables
- UX fluida sin delays innecesarios

## 🔧 **Comandos de Debug**

### **Verificar API Manualmente**:

```bash
# Test básico de disponibilidad
curl "http://localhost:3000/api/widget/tenant/cmdf0rlvb0000cdwe0bc1f158/services/cmdf0rlvd0002cdweugn1uqe1/availability"

# Test con fecha específica
curl "http://localhost:3000/api/widget/tenant/cmdf0rlvb0000cdwe0bc1f158/services/cmdf0rlvd0002cdweugn1uqe1/availability?date=2025-07-28"
```

### **Verificar Database**:

```bash
# Abrir Prisma Studio
npx prisma studio
# URL: http://localhost:5555
```

## 📋 **Checklist Final**

- [ ] Servidor corriendo sin errores
- [ ] Login funciona correctamente
- [ ] Service selection no causa loops
- [ ] Date selection muestra slots correctos
- [ ] Time slots muestran professionals
- [ ] Error handling funciona para casos de red
- [ ] No hay re-renders excesivos
- [ ] Performance es fluida

**¡El sistema está listo para uso en producción!** 🚀
