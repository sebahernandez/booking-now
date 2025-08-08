import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail, sendBookingNotificationToTenant } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
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
      tenantId,
    } = body;

    // Validate required fields
    if (
      !serviceId ||
      !date ||
      !time ||
      !customerName ||
      !customerEmail ||
      !tenantId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
        isActive: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found or inactive" },
        { status: 404 }
      );
    }

    // Get service details for duration and price
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        tenantId: tenantId, // Ensure service belongs to this tenant
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Create or find user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          role: "CLIENT",
          tenantId: tenantId, // Associate user with tenant
        },
      });
    }

    // Calculate start and end times (consistent with availability API using UTC)
    let startDateTime: Date;
    let endDateTime: Date;

    // Parse the date consistently with availability API
    const [year, month, day] = date.split("-").map(Number);

    // Check if time is a range (e.g., "09:00 - 12:00") or single time (e.g., "09:00")
    if (time.includes(" - ")) {
      // Handle time range
      const [startTime, endTime] = time.split(" - ");
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      // Create UTC dates to match availability API logic
      startDateTime = new Date(Date.UTC(year, month - 1, day, startHours, startMinutes, 0, 0));
      endDateTime = new Date(Date.UTC(year, month - 1, day, endHours, endMinutes, 0, 0));
    } else {
      // Handle single time (legacy support)
      const [hours, minutes] = time.split(":").map(Number);
      
      // Create UTC date to match availability API logic
      startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
      endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);
    }

    // Check if the time slot is available
    const whereCondition = {
      serviceId,
      tenantId: tenantId, // Ensure we only check within this tenant
      startDateTime: {
        lt: endDateTime,
      },
      endDateTime: {
        gt: startDateTime,
      },
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      ...(professionalId && professionalId !== "any" && { professionalId }),
    };

    const existingBooking = await prisma.booking.findFirst({
      where: whereCondition,
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Time slot not available" },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        professionalId:
          professionalId && professionalId !== "any" ? professionalId : null,
        serviceId,
        tenantId: tenantId,
        startDateTime,
        endDateTime,
        totalPrice: service.price,
        notes,
        status: "PENDING",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
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
        service: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send email confirmation to client
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
          name: booking.tenant.name,
          email: booking.tenant.email,
          phone: booking.tenant.phone,
        },
        notes: notes || '',
      };

      // La función sendBookingConfirmationEmail ya maneja el envío secuencial al cliente y tenant
      await sendBookingConfirmationEmail(emailData);
    } catch (emailError) {
      console.error("Error sending email confirmation:", emailError);
      
      // Log informativo para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log("🔧 INFORMACIÓN DE DESARROLLO:");
        console.log(`   Cliente: ${booking.client?.name} (${customerEmail})`);
        console.log(`   Reserva: #${booking.id}`);
        console.log("   Para recibir emails reales, verifica un dominio en resend.com");
      }
      
      // No fallar la reserva si falla el email
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking for widget:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
