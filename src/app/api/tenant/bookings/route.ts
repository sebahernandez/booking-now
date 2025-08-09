import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, getNotificationMessages } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";
import { sendBookingConfirmationEmail, sendBookingNotificationToTenant } from "@/lib/email";

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

    // Check service availability for the requested time slot (consistent with availability API)
    const requestedDate = new Date(startDateTime);
    const dayOfWeek = requestedDate.getUTCDay(); // Use UTC day to match availability API
    const requestedTime = requestedDate.toISOString().slice(11, 16); // HH:MM format in UTC
    const endTime = new Date(endDateTime).toISOString().slice(11, 16); // HH:MM format in UTC
    
    console.log('Time validation:', {
      dayOfWeek,
      requestedTime,
      endTime,
      requestedDate: requestedDate.toISOString()
    });

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

    // Create notification for the tenant (non-blocking)
    const { title, message } = getNotificationMessages(
      NotificationType.NEW_BOOKING,
      clientName,
      service.name,
      new Date(startDateTime)
    );

    createNotification({
      tenantId: session.user.tenantId,
      bookingId: booking.id,
      type: NotificationType.NEW_BOOKING,
      title,
      message,
    }).catch(error => {
      console.error("Error creating notification:", error);
    });

    // Send email confirmation to client
    try {
      // Get tenant information for the email
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
        select: {
          name: true,
          email: true,
          phone: true,
        },
      });

      const emailData = {
        id: booking.id,
        clientName: booking.client.name || clientName,
        clientEmail: booking.client.email,
        clientPhone: booking.client.phone || clientPhone,
        date: new Date(startDateTime),
        startTime: new Date(startDateTime).toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: new Date(endDateTime).toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        service: {
          name: booking.service.name,
          duration: booking.service.duration,
          price: booking.service.price,
        },
        professional: {
          name: booking.professional?.user?.name || 'No asignado',
          email: booking.professional?.user?.email,
        },
        tenant: {
          name: tenant?.name || 'BookingNow',
          email: tenant?.email,
          phone: tenant?.phone,
        },
        notes: notes || '',
      };

      // La función sendBookingConfirmationEmail ya maneja el envío secuencial al cliente y tenant
      await sendBookingConfirmationEmail(emailData);
    } catch (emailError) {
      console.error("Error sending email confirmation:", emailError);
      // No fallar la reserva si falla el email
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error("Detailed error creating booking (tenant):", {
      message: err.message || 'Unknown error',
      stack: err.stack || 'No stack trace', 
      name: err.name || 'Unknown',
      code: err.code || 'No code'
    });
    
    // Proveer error más específico
    let errorMessage = "Error interno del servidor";
    let statusCode = 500;
    
    if (err.code === 'P2002') {
      errorMessage = "Conflicto de datos: ya existe una reserva similar";
      statusCode = 409;
    } else if (err.code === 'P2025') {
      errorMessage = "Registro no encontrado";
      statusCode = 404;
    } else if (err.message?.includes('timeout')) {
      errorMessage = "Timeout de base de datos";
      statusCode = 504;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: statusCode }
    );
  } finally {
    // Liberar conexiones en producción
    await prisma.$disconnect();
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
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

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

    const pageSize = limit ? parseInt(limit) : 100;
    const currentPage = page ? parseInt(page) : 1;
    const skip = (currentPage - 1) * pageSize;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
        skip,
        take: pageSize,
      }),
      prisma.booking.count({
        where: whereClause,
      }),
    ]);

    // Format bookings to maintain compatibility with both table and calendar components
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      startDateTime: booking.startDateTime.toISOString(),
      endDateTime: booking.endDateTime.toISOString(),
      status: booking.status,
      totalPrice: booking.totalPrice || 0,
      notes: booking.notes,
      client: {
        name: booking.client?.name || booking.client?.email || "Cliente",
        email: booking.client?.email || "",
        phone: booking.client?.phone,
      },
      service: {
        name: booking.service?.name || "Servicio",
        duration: booking.service?.duration || 0,
      },
      professional: booking.professional ? {
        user: {
          name: booking.professional.user?.name || "Sin asignar",
        },
      } : undefined,
      // Legacy properties for table component compatibility
      clientName: booking.client?.name || booking.client?.email || "Cliente",
      clientEmail: booking.client?.email,
      serviceName: booking.service?.name || "Servicio",
      professionalName: booking.professional?.user?.name || "Sin asignar",
    }));

    return NextResponse.json({
      bookings: formattedBookings,
      total,
      page: currentPage,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
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
