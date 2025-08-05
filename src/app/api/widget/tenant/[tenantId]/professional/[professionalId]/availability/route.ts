import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { tenantId: string; professionalId: string } }
) {
  try {
    const { tenantId, professionalId } = context.params;

    // Verificar que el professional pertenece al tenant
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId: tenantId,
        isAvailable: true,
      },
      include: {
        availabilitySlots: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isAvailable: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado o no disponible" },
        { status: 404 }
      );
    }

    // Formatear la respuesta para compatibilidad con el widget
    const weeklySchedule: Record<
      string,
      {
        isWorking: boolean;
        timeSlots: Array<{ startTime: string; endTime: string }>;
      }
    > = {
      monday: { isWorking: false, timeSlots: [] },
      tuesday: { isWorking: false, timeSlots: [] },
      wednesday: { isWorking: false, timeSlots: [] },
      thursday: { isWorking: false, timeSlots: [] },
      friday: { isWorking: false, timeSlots: [] },
      saturday: { isWorking: false, timeSlots: [] },
      sunday: { isWorking: false, timeSlots: [] },
    };

    // Convertir availability slots al formato esperado
    professional.availabilitySlots.forEach((slot) => {
      if (!slot.isAvailable) return;

      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayName = dayNames[slot.dayOfWeek] as keyof typeof weeklySchedule;

      if (weeklySchedule[dayName]) {
        weeklySchedule[dayName].isWorking = true;
        weeklySchedule[dayName].timeSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    });

    const response = {
      professional: {
        id: professional.id,
        name: professional.user.name,
        email: professional.user.email,
        bio: professional.bio,
        hourlyRate: professional.hourlyRate,
      },
      weeklySchedule,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Error fetching professional availability for widget:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
