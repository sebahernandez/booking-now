import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, getDay } from "date-fns";
import { BookingStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const { id: serviceId } = context.params;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const professionalId = searchParams.get("professionalId");

    if (!date) {
      return NextResponse.json({ error: "date es requerido" }, { status: 400 });
    }

    const targetDate = parseISO(date);
    const dayOfWeek = getDay(targetDate);

    // Get service details
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

    // Get service availability schedules
    const serviceAvailability = await prisma.serviceAvailability.findMany({
      where: {
        serviceId: serviceId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    if (serviceAvailability.length === 0) {
      return NextResponse.json([]);
    }

    // Get existing bookings for this date and service using UTC
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        startDateTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        ...(professionalId && professionalId !== "any" && { professionalId }),
      },
    });

    // Generate time slots based on service availability
    const timeSlots: Array<{
      time: string;
      isAvailable: boolean;
      reason?: string;
    }> = [];

    serviceAvailability.forEach((availability) => {
      const slots = generateTimeSlots(
        availability.startTime,
        availability.endTime,
        service.duration,
        existingBookings,
        targetDate
      );
      timeSlots.push(...slots);
    });

    // Sort time slots by time
    timeSlots.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error("Error fetching service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  serviceDuration: number,
  existingBookings: Array<{
    id: string;
    startDateTime: Date;
    endDateTime: Date;
  }>,
  targetDate: Date
): Array<{ time: string; isAvailable: boolean; reason?: string }> {
  const slots: Array<{ time: string; isAvailable: boolean; reason?: string }> =
    [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentTime = startHour * 60 + startMinute; // minutes from midnight
  const endTimeMinutes = endHour * 60 + endMinute;

  // Generate 30-minute slots within the availability window
  while (currentTime + serviceDuration <= endTimeMinutes) {
    const hour = Math.floor(currentTime / 60);
    const minute = currentTime % 60;
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Check if this time slot conflicts with existing bookings using UTC
    const slotStartTime = new Date(targetDate);
    slotStartTime.setUTCHours(hour, minute, 0, 0);

    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setUTCMinutes(slotEndTime.getUTCMinutes() + serviceDuration);

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startDateTime);
      const bookingEnd = new Date(booking.endDateTime);

      // Check for time overlap
      return (
        (slotStartTime >= bookingStart && slotStartTime < bookingEnd) ||
        (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
        (slotStartTime <= bookingStart && slotEndTime >= bookingEnd)
      );
    });

    slots.push({
      time: timeString,
      isAvailable: !hasConflict,
      reason: hasConflict ? "Horario ocupado" : undefined,
    });

    currentTime += 30; // Move to next 30-minute slot
  }

  return slots;
}
