import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isBefore,
  parse,
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

      return NextResponse.json({
        success: true,
        availabilitySchedule: availability,
      });
    }

    // Parse the date for time slot generation
    const selectedDate = parse(dateParam, "yyyy-MM-dd", new Date());
    const dayOfWeek = selectedDate.getDay();

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

    // Get service availability for this day of week
    const dayAvailability = await prisma.serviceAvailability.findMany({
      where: {
        serviceId: serviceId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
      orderBy: { startTime: "asc" },
    });

    if (dayAvailability.length === 0) {
      return NextResponse.json({
        success: true,
        availability: [],
        message: "No hay disponibilidad para este día",
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        date: dateParam,
      });
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
          in: ["PENDING", "CONFIRMED"],
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

    // Generate available time slots based on service availability
    const timeSlots: TimeSlot[] = [];
    const slotDuration = service.duration || 30;
    const slotInterval = 30; // Generate slots every 30 minutes

    dayAvailability.forEach(availability => {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      for (let totalMinutes = startTotalMinutes; totalMinutes < endTotalMinutes; totalMinutes += slotInterval) {
        const slotEndTotalMinutes = totalMinutes + slotDuration;
        
        // Check if the service duration fits within availability window
        if (slotEndTotalMinutes <= endTotalMinutes) {
          const hour = Math.floor(totalMinutes / 60);
          const minute = totalMinutes % 60;
          
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Check if slot is in the past (only for today)
          const now = new Date();
          const isToday = isSameDay(selectedDate, now);
          const isPast = isToday && isBefore(slotTime, now);
          
          const timeString = format(slotTime, "HH:mm");
          
          timeSlots.push({
            time: timeString,
            available: !isPast && !bookedTimes.has(timeString),
          });
        }
      }
    });

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
