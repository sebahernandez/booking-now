import { prisma } from "@/lib/prisma";

export async function createNotification({
  tenantId,
  bookingId,
  type,
  title,
  message,
}: {
  tenantId: string;
  bookingId?: string;
  type: "NEW_BOOKING" | "BOOKING_CANCELLED" | "BOOKING_UPDATED";
  title: string;
  message: string;
}) {
  try {
    // Usar una consulta SQL raw temporal hasta que se resuelva el problema de Prisma
    await prisma.$executeRaw`
      INSERT INTO notifications (id, "tenantId", "bookingId", type, title, message, read, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${tenantId}, ${bookingId || null}, ${type}::"NotificationType", ${title}, ${message}, false, now(), now())
    `;
  } catch (error) {
    console.error("Error creating notification:", error);
    // No lanzar error para no fallar la operación principal
  }
}

export function getNotificationMessages(
  type: "NEW_BOOKING" | "BOOKING_CANCELLED" | "BOOKING_UPDATED",
  clientName: string,
  serviceName: string,
  startDateTime: Date
) {
  const dateStr = startDateTime.toLocaleDateString("es-CL");
  const timeStr = startDateTime.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (type) {
    case "NEW_BOOKING":
      return {
        title: "Nueva reserva creada",
        message: `${clientName} ha reservado ${serviceName} para el ${dateStr} a las ${timeStr}`,
      };
    case "BOOKING_CANCELLED":
      return {
        title: "Reserva cancelada",
        message: `La reserva de ${clientName} para ${serviceName} ha sido cancelada`,
      };
    case "BOOKING_UPDATED":
      return {
        title: "Reserva actualizada",
        message: `La reserva de ${clientName} para ${serviceName} ha sido actualizada`,
      };
    default:
      return {
        title: "Notificación",
        message: "Ha ocurrido un cambio en una reserva",
      };
  }
}
