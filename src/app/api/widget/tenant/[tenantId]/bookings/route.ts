import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification, getNotificationMessages } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();

    const {
      serviceId,
      professionalId,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // Validar campos requeridos
    if (!serviceId || !date || !time || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el servicio pertenece al tenant
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        tenantId: tenantId,
        isActive: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Si se especifica un profesional, verificar que pertenece al tenant
    if (professionalId && professionalId !== "any") {
      const professional = await prisma.professional.findFirst({
        where: {
          id: professionalId,
          tenantId: tenantId,
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

    // Buscar o crear el usuario/cliente
    let client = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!client) {
      client = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          role: "CLIENT",
          tenantId: tenantId,
        },
      });
    }

    // Parsear la fecha y hora con manejo mejorado para producción
    console.log('Processing booking with raw data:', { date, time, serviceId, tenantId });
    
    const [year, month, day] = date.split("-").map(Number);
    const [timeRange] = time.split(" - ");
    const [hours, minutes] = timeRange.split(":").map(Number);

    // Crear fechas en UTC para evitar problemas de zona horaria en producción
    const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    const endDateTime = new Date(startDateTime.getTime() + (service.duration * 60 * 1000));
    
    console.log('Parsed datetime:', {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      duration: service.duration
    });

    // Verificar disponibilidad antes de crear
    console.log('Checking availability for:', {
      serviceId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    // Verificar conflictos de horario
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        serviceId: serviceId,
        tenantId: tenantId,
        status: {
          in: ["PENDING", "CONFIRMED"]
        },
        OR: [
          {
            startDateTime: {
              gte: startDateTime,
              lt: endDateTime
            }
          },
          {
            endDateTime: {
              gt: startDateTime,
              lte: endDateTime
            }
          },
          {
            startDateTime: {
              lte: startDateTime
            },
            endDateTime: {
              gte: endDateTime
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      console.log('Booking conflict found:', conflictingBooking.id);
      return NextResponse.json(
        { error: "Este horario ya está ocupado" },
        { status: 409 }
      );
    }

    // Crear la reserva
    console.log('Creating booking...');
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        professionalId: professionalId !== "any" ? professionalId : null,
        serviceId: serviceId,
        tenantId: tenantId,
        startDateTime,
        endDateTime,
        totalPrice: service.price,
        notes: notes || "",
        status: "PENDING",
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        professional: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Crear notificación para el tenant (non-blocking)
    const { title, message } = getNotificationMessages(
      NotificationType.NEW_BOOKING,
      client.name || client.email,
      service.name,
      startDateTime
    );

    createNotification({
      tenantId,
      bookingId: booking.id,
      type: NotificationType.NEW_BOOKING,
      title,
      message,
    }).catch(error => {
      console.error("Error creating notification:", error);
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        service: booking.service,
        professional: booking.professional?.user,
        client: booking.client,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Detailed error creating booking for widget:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Proveer error más específico
    let errorMessage = "Error interno del servidor";
    let statusCode = 500;
    
    if (error.code === 'P2002') {
      errorMessage = "Conflicto de datos: ya existe una reserva similar";
      statusCode = 409;
    } else if (error.code === 'P2025') {
      errorMessage = "Registro no encontrado";
      statusCode = 404;
    } else if (error.message.includes('timeout')) {
      errorMessage = "Timeout de base de datos";
      statusCode = 504;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  } finally {
    // Asegurar que las conexiones se liberen en producción
    await prisma.$disconnect();
  }
}
