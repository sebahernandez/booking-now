import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isBefore,
  parse,
  addMinutes,
} from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; serviceId: string }> }
) {
  try {
    const { tenantId, serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!tenantId || !serviceId) {
      return NextResponse.json(
        { error: "ID del tenant y servicio son requeridos" },
        { status: 400 }
      );
    }

    // If no date provided, return basic service availability config
    if (!dateParam) {
      const availability = await prisma.serviceAvailability.findMany({
        where: {
          serviceId: serviceId,
          isActive: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });

      return NextResponse.json(availability);
    }

    // Parse the date for time slot generation
    const selectedDate = parse(dateParam, "yyyy-MM-dd", new Date());

    // Verificar que el servicio pertenece al tenant
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        tenantId: tenantId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Get existing bookings for this date and service
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        startDateTime: {
          gte: startOfDay(selectedDate),
          lt: addDays(startOfDay(selectedDate), 1),
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        startDateTime: true,
      },
    });

    // Get booked time slots
    const bookedTimes = new Set(
      existingBookings.map((booking) => format(booking.startDateTime, "HH:mm"))
    );

    // Generate available time slots
    const timeSlots: TimeSlot[] = [];

    // Service working hours (you can make this dynamic per service later)
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const slotDuration = service.duration || 30; // Default 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 30]) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minutes, 0, 0);

        // Check if slot is in the past (only for today)
        const now = new Date();
        const isToday = isSameDay(selectedDate, now);
        const isPast = isToday && isBefore(slotTime, now);

        // Skip lunch break (1-2 PM) - you can make this configurable
        const isLunchBreak = hour === 13;

        // Check if there's enough time for the service duration
        const slotEndTime = addMinutes(slotTime, slotDuration);
        const isSlotTooLate = slotEndTime.getHours() >= endHour;

        const timeString = format(slotTime, "HH:mm");

        if (!isLunchBreak && !isSlotTooLate) {
          timeSlots.push({
            time: timeString,
            available: !isPast && !bookedTimes.has(timeString),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      availability: timeSlots,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
      },
      date: dateParam,
    });
  } catch (error) {
    console.error("Error fetching service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
