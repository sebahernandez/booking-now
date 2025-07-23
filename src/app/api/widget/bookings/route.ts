import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking for widget:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
