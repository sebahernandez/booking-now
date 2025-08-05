// Utilidades para manejar eventos de notificaciones

/**
 * Dispara un evento personalizado para indicar que hay una nueva notificación
 * Esto permite que el componente Notifications se actualice inmediatamente
 */
export function triggerNewNotificationEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newNotification'));
  }
}

/**
 * Hook personalizado para disparar actualizaciones de notificaciones
 */
export function useNotificationUpdater() {
  return {
    triggerUpdate: triggerNewNotificationEvent
  };
}

/**
 * Crea una notificación en el servidor y dispara el evento de actualización
 */
export async function createNotificationAndUpdate(notificationData: {
  tenantId: string;
  bookingId?: string;
  type: 'NEW_BOOKING' | 'BOOKING_CANCELLED' | 'BOOKING_UPDATED';
  title: string;
  message: string;
}) {
  try {
    const response = await fetch('/api/tenant/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (response.ok) {
      triggerNewNotificationEvent();
      return await response.json();
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
