import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus, UserRole } from "@prisma/client";
import { createNotification, getNotificationMessages } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";

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
    } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get service details for duration and price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
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
          role: UserRole.CLIENT,
        },
      });
    }

    // Calculate start and end times
    let startDateTime: Date;
    let endDateTime: Date;

    // Check if time is a range (e.g., "09:00 - 12:00") or single time (e.g., "09:00")
    if (time.includes(" - ")) {
      // Handle time range
      const [startTime, endTime] = time.split(" - ");
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      startDateTime = new Date(date);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      endDateTime = new Date(date);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
    } else {
      // Handle single time (legacy support)
      const [hours, minutes] = time.split(":").map(Number);
      startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);

      endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);
    }

    // Check if the time slot is available
    const whereCondition = {
      serviceId,
      startDateTime: {
        lt: endDateTime,
      },
      endDateTime: {
        gt: startDateTime,
      },
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
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
        tenantId: service.tenantId,
        startDateTime,
        endDateTime,
        totalPrice: service.price,
        notes,
        status: BookingStatus.PENDING,
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
      },
    });

    // Create notification for the tenant (non-blocking)
    const { title, message } = getNotificationMessages(
      NotificationType.NEW_BOOKING,
      customerName,
      service.name,
      startDateTime
    );

    createNotification({
      tenantId: service.tenantId,
      bookingId: booking.id,
      type: NotificationType.NEW_BOOKING,
      title,
      message,
    }).catch(error => {
      console.error("Error creating notification:", error);
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
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
      },
      orderBy: {
        startDateTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
