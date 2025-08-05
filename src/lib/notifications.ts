import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification({
  tenantId,
  bookingId,
  type,
  title,
  message,
}: {
  tenantId: string;
  bookingId?: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        tenantId,
        bookingId: bookingId || null,
        type,
        title,
        message,
        read: false,
      }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    // No lanzar error para no fallar la operación principal
  }
}

export function getNotificationMessages(
  type: NotificationType,
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
