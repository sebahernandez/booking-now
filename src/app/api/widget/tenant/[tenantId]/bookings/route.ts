import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification, getNotificationMessages } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";
import { sendBookingConfirmationEmail, sendBookingNotificationToTenant } from "@/lib/email";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
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
    const [year, month, day] = date.split("-").map(Number);
    const [timeRange] = time.split(" - ");
    const [hours, minutes] = timeRange.split(":").map(Number);

    // Crear fechas en UTC para evitar problemas de zona horaria en producción
    const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    const endDateTime = new Date(startDateTime.getTime() + (service.duration * 60 * 1000));
    
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

    // Obtener información del tenant para el email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    // Enviar email de confirmación al cliente
    try {
      const emailData = {
        id: booking.id,
        clientName: booking.client.name || customerName,
        clientEmail: booking.client.email,
        clientPhone: customerPhone || '',
        date: startDateTime,
        startTime: startDateTime.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: endDateTime.toLocaleTimeString('es-CO', { 
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

      console.log(`📧 [WIZARD] Enviando confirmación de reserva #${booking.id} a ${booking.client.email}`);
      // La función sendBookingConfirmationEmail ya maneja el envío secuencial al cliente y tenant
      await sendBookingConfirmationEmail(emailData);
    } catch (emailError) {
      console.error("Error sending email confirmation from wizard:", emailError);
      
      // Log informativo para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log("🔧 [WIZARD] INFORMACIÓN DE DESARROLLO:");
        console.log(`   Cliente: ${customerName} (${customerEmail})`);
        console.log(`   Reserva: #${booking.id}`);
        console.log("   Para recibir emails reales, verifica un dominio en resend.com");
      }
      
      // No fallar la reserva si falla el email
    }

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
    const err = error as Error & { code?: string };
    console.error("Detailed error creating booking for widget:", {
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
    // Asegurar que las conexiones se liberen en producción
    await prisma.$disconnect();
  }
}
