import { BookingData } from "@/types/booking-wizard";
import { triggerNewNotificationEvent } from "@/utils/notification-utils";

export class BookingApiService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async createBooking(
    bookingData: BookingData
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      // Validar que tenemos los datos mínimos requeridos
      if (
        !bookingData.service?.id ||
        !bookingData.selectedDate ||
        !bookingData.selectedTime ||
        !bookingData.clientName?.trim() ||
        !bookingData.clientEmail?.trim()
      ) {
        return {
          success: false,
          error: "Faltan datos requeridos para crear la reserva",
        };
      }

      const response = await fetch(
        `/api/widget/tenant/${this.tenantId}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: bookingData.service.id,
            professionalId: bookingData.professional?.id || null,
            date: bookingData.selectedDate, // Backend espera 'date' no 'dateTime'
            time: bookingData.selectedTime, // Backend espera 'time' separado
            customerName: bookingData.clientName?.trim() || "", // Limpiar espacios al enviar
            customerEmail: bookingData.clientEmail?.trim() || "", // Limpiar espacios al enviar
            customerPhone: bookingData.clientPhone?.trim() || "", // Limpiar espacios al enviar
            notes: bookingData.notes?.trim() || "",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Disparar evento para actualizar notificaciones inmediatamente
        triggerNewNotificationEvent();
        return { success: true, data: result };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Error al crear la reserva",
        };
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, error: "Error de conexión al crear la reserva" };
    }
  }
}
