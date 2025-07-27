import { BookingData } from "@/types/booking-wizard";

export class BookingApiService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async createBooking(
    bookingData: BookingData
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      const response = await fetch(
        `/api/widget/tenant/${this.tenantId}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: bookingData.service?.id,
            professionalId: bookingData.professional?.id,
            dateTime: bookingData.dateTime,
            clientName: bookingData.clientName,
            clientEmail: bookingData.clientEmail,
            clientPhone: bookingData.clientPhone,
            notes: bookingData.notes,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
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
