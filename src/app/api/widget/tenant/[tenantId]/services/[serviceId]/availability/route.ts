import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  format,
  isSameDay,
  isBefore,
} from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  professionals?: {
    id: string;
    user: {
      name: string;
    };
  }[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string; serviceId: string }> }
) {
  try {
    const { tenantId, serviceId } = await context.params;
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

    // Parse the date for time slot generation (consistent with booking creation)
    const [year, month, day] = dateParam.split("-").map(Number);
    const selectedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayOfWeek = selectedDate.getUTCDay();

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
      // Debug: Check if there's any availability config for this service
      const allAvailability = await prisma.serviceAvailability.findMany({
        where: { serviceId: serviceId },
      });
      
      return NextResponse.json({
        success: true,
        availability: [],
        message: "No hay disponibilidad configurada para este día",
        debug: {
          dayOfWeek,
          totalAvailabilityConfigs: allAvailability.length,
          availabilityConfigs: allAvailability,
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        date: dateParam,
      });
    }

    // Get existing bookings for this date and service (UTC consistent)
    const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        startDateTime: {
          gte: startOfDayUTC,
          lte: endOfDayUTC,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        startDateTime: true,
        professionalId: true,
      },
    });

    // Get professionals available for this service
    const availableProfessionals = await prisma.professional.findMany({
      where: {
        tenantId: tenantId,
        services: {
          some: {
            serviceId: serviceId,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get booked time slots with professional info
    const bookedSlots = new Map<string, Set<string>>();
    existingBookings.forEach((booking) => {
      const timeString = format(booking.startDateTime, "HH:mm");
      if (!bookedSlots.has(timeString)) {
        bookedSlots.set(timeString, new Set());
      }
      if (booking.professionalId) {
        bookedSlots.get(timeString)!.add(booking.professionalId);
      }
    });

    // Generate available time slots based on service availability
    const timeSlots: TimeSlot[] = [];
    const slotDuration = service.duration || 30;
    const slotInterval = 30; // Generate slots every 30 minutes

    dayAvailability.forEach((availability) => {
      const [startHour, startMinute] = availability.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = availability.endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      for (
        let totalMinutes = startTotalMinutes;
        totalMinutes < endTotalMinutes;
        totalMinutes += slotInterval
      ) {
        const slotEndTotalMinutes = totalMinutes + slotDuration;

        // Check if the service duration fits within availability window
        if (slotEndTotalMinutes <= endTotalMinutes) {
          const hour = Math.floor(totalMinutes / 60);
          const minute = totalMinutes % 60;

          // Create slot time in UTC to match booking creation logic
          const slotTime = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

          // Check if slot is in the past (using UTC)
          const now = new Date();
          const isToday = isSameDay(selectedDate, now);
          const isPast = isToday && isBefore(slotTime, now);

          const timeString = format(slotTime, "HH:mm");

          // Get professionals not booked at this time
          const bookedProfessionalIds =
            bookedSlots.get(timeString) || new Set();
          const availableProfessionalsForSlot = availableProfessionals
            .filter((prof) => !bookedProfessionalIds.has(prof.id))
            .map((prof) => ({
              id: prof.id,
              user: {
                name: prof.user.name || "Profesional",
              },
            }));

          timeSlots.push({
            time: timeString,
            available: !isPast && availableProfessionalsForSlot.length > 0,
            professionals: availableProfessionalsForSlot,
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
