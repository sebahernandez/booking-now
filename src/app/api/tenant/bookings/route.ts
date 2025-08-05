import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, getNotificationMessages } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      professionalId,
      startDateTime,
      endDateTime,
      totalPrice,
      notes,
    } = body;

    // Validate required fields
    if (
      !serviceId ||
      !startDateTime ||
      !endDateTime ||
      !clientName ||
      !clientEmail
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verify service belongs to tenant
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        tenantId: session.user.tenantId,
        isActive: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // If professional specified, verify it belongs to tenant
    if (professionalId) {
      const professional = await prisma.professional.findFirst({
        where: {
          id: professionalId,
          tenantId: session.user.tenantId,
          isAvailable: true,
        },
      });

      if (!professional) {
        return NextResponse.json(
          { error: "Profesional no encontrado" },
          { status: 404 }
        );
      }
    }

    // Check service availability for the requested time slot
    const requestedDate = new Date(startDateTime);
    const dayOfWeek = requestedDate.getDay();
    const requestedTime = requestedDate.toTimeString().slice(0, 5); // HH:MM format
    const endTime = new Date(endDateTime).toTimeString().slice(0, 5); // HH:MM format

    // Get service availability for this day and time
    const serviceAvailability = await prisma.serviceAvailability.findFirst({
      where: {
        serviceId: serviceId,
        dayOfWeek: dayOfWeek,
        isActive: true,
        startTime: {
          lte: requestedTime,
        },
        endTime: {
          gte: endTime,
        },
      },
    });

    if (!serviceAvailability) {
      return NextResponse.json(
        { error: "El servicio no está disponible en este horario" },
        { status: 409 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        serviceId: serviceId,
        startDateTime: {
          lt: new Date(endDateTime),
        },
        endDateTime: {
          gt: new Date(startDateTime),
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        ...(professionalId && { professionalId }),
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { error: "Este horario ya está ocupado" },
        { status: 409 }
      );
    }

    // Find or create client
    let client = await prisma.user.findUnique({
      where: { email: clientEmail },
    });

    if (!client) {
      client = await prisma.user.create({
        data: {
          email: clientEmail,
          name: clientName,
          phone: clientPhone,
          role: "CLIENT",
          tenantId: session.user.tenantId,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        professionalId: professionalId || null,
        serviceId: serviceId,
        tenantId: session.user.tenantId,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        totalPrice: totalPrice || service.price,
        notes: notes || "",
        status: "PENDING",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    // Create notification for the tenant
    try {
      const { title, message } = getNotificationMessages(
        "NEW_BOOKING",
        clientName,
        service.name,
        new Date(startDateTime)
      );

      await createNotification({
        tenantId: session.user.tenantId,
        bookingId: booking.id,
        type: 'NEW_BOOKING',
        title,
        message,
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // No fallar la reserva si falla la notificación
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: {
        startDateTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching tenant bookings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de la reserva es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la reserva pertenece al tenant
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        tenantId: session.user.tenantId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la reserva completamente
    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    return NextResponse.json({ message: "Reserva eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
