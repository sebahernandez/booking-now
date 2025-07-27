# Fix para Error "Failed to fetch" - BookingWizard

## Problema Identificado

El hook `useServiceAvailability` estaba presentando errores de "Failed to fetch" sin manejo adecuado de errores de red y sin opciones de recuperación para el usuario.

## Soluciones Implementadas

### 1. 🔄 **Fetch con Retry Automático**

- Función `fetchWithRetry` que reintenta automáticamente hasta 2 veces
- Backoff exponencial entre reintentos (1s, 2s, 4s)
- Timeout de 10 segundos por petición

```typescript
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      // ... lógica de retry
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};
```

### 2. 🚨 **Manejo Mejorado de Errores**

- Detección específica de tipos de error (timeout, network, HTTP)
- Mensajes de error más descriptivos para el usuario
- Logging detallado para debugging

```typescript
if (error.name === "AbortError") {
  setError("Tiempo de espera agotado. Verifica tu conexión a internet.");
} else if (error.message.includes("Failed to fetch")) {
  setError(
    "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
  );
}
```

### 3. 🔄 **Botones de Retry Manual**

- Funciones `retryFetchAvailability` y `retryGenerateSlots` expuestas desde el hook
- Botón de "Reintentar" en la UI cuando hay errores de red

### 4. 🎨 **Componente NetworkError**

- Componente reutilizable para mostrar errores de red
- Interfaz clara con sugerencias para el usuario
- Botón de retry integrado con estados de loading

```tsx
<NetworkError error={error} onRetry={onRetry} loading={loading} />
```

### 5. 📡 **Headers HTTP Mejorados**

- Content-Type explícito en todas las peticiones
- Headers consistentes en todas las llamadas a la API

## Archivos Modificados

### ✏️ **Modificados**

- `src/hooks/useServiceAvailability.ts` - Lógica de retry y manejo de errores
- `src/hooks/useBookingWizard.ts` - Integración de funciones de retry
- `src/components/booking/steps/TimeSelection.tsx` - Integración del componente de error
- `src/components/booking/booking-wizard.tsx` - Passing de props de error y retry

### ➕ **Creados**

- `src/components/booking/NetworkError.tsx` - Componente para errores de red

## Beneficios

### 🛡️ **Resilencia**

- Recuperación automática de errores temporales de red
- Timeout prevents hanging requests
- Retry manual para casos persistentes

### 👤 **Experiencia de Usuario**

- Mensajes de error claros y accionables
- Opciones de recuperación sin recargar la página
- Indicadores visuales de estado (loading, error, retry)

### 🔧 **Debugging**

- Logs detallados de cada intento de petición
- Información específica sobre tipos de error
- Tracking de reintentos automáticos

### 🚀 **Performance**

- Timeouts evitan peticiones que cuelgan indefinidamente
- Reintentos inteligentes con backoff exponencial
- Evita spam de peticiones al servidor

## Uso

El sistema ahora maneja automáticamente:

1. **Errores temporales de red** → Retry automático
2. **Timeouts** → Retry automático con mensaje claro
3. **Errores persistentes** → Botón de retry manual
4. **Errores de servidor** → Mensaje específico con código HTTP

Los usuarios ahora tienen una experiencia más robusta con opciones claras de recuperación cuando hay problemas de conectividad.

## Testing

Para probar las mejoras:

1. **Desconectar internet** temporalmente → Debe mostrar error de conexión con botón retry
2. **Bloquear API calls** en DevTools → Debe mostrar timeout con retry automático
3. **Servidor API down** → Debe mostrar error HTTP específico

```bash
# Ejecutar en desarrollo
npm run dev

# Visitar: http://localhost:3000
# Navegar al wizard y probar selección de servicios/fechas
```
