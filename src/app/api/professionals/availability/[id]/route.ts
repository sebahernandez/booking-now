import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: professionalId } = await params;

    // Fetch real availability from database
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        professionalId: professionalId,
        isAvailable: true,
        specificDate: null, // Only get regular weekly schedule, not date-specific overrides
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Convert database format to API format
    const weeklySchedule = {
      sunday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      monday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      tuesday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      wednesday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      thursday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      friday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
      saturday: {
        isWorking: false,
        timeSlots: [] as Array<{ startTime: string; endTime: string }>,
      },
    };

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    // Group slots by day of week
    availabilitySlots.forEach((slot) => {
      const dayName = dayNames[slot.dayOfWeek] as keyof typeof weeklySchedule;
      weeklySchedule[dayName].isWorking = true;
      weeklySchedule[dayName].timeSlots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    });

    const availability = {
      id: `availability_${professionalId}`,
      professionalId,
      weeklySchedule,
      exceptions: [],
      timeZone: "America/Argentina/Buenos_Aires",
    };

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching professional availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: professionalId } = await params;
    const availabilityData = await request.json();

    // Validate that the professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Update availability in database using a transaction
    await prisma.$transaction(async (tx) => {
      // First, delete all existing availability slots for this professional
      await tx.availabilitySlot.deleteMany({
        where: {
          professionalId: professionalId,
          specificDate: null, // Only delete regular weekly schedule, not date-specific overrides
        },
      });

      // Then, create new availability slots based on the provided data
      const newSlots: Array<{
        professionalId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        specificDate: null;
      }> = [];

      // Convert the weeklySchedule format to database records
      for (const [dayName, dayData] of Object.entries(
        availabilityData.weeklySchedule
      )) {
        const typedDayData = dayData as {
          isWorking: boolean;
          timeSlots: Array<{ startTime: string; endTime: string }>;
        };

        if (
          typedDayData.isWorking &&
          typedDayData.timeSlots &&
          typedDayData.timeSlots.length > 0
        ) {
          const dayOfWeekMap: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
          };

          const dayOfWeek = dayOfWeekMap[dayName];

          if (dayOfWeek !== undefined) {
            for (const timeSlot of typedDayData.timeSlots) {
              newSlots.push({
                professionalId: professionalId,
                dayOfWeek: dayOfWeek,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                isAvailable: true,
                specificDate: null,
              });
            }
          }
        }
      }

      // Create all new slots
      if (newSlots.length > 0) {
        await tx.availabilitySlot.createMany({
          data: newSlots,
        });
      }
    });

    // Return success response with updated data
    return NextResponse.json({
      message: "Horarios actualizados exitosamente",
      professionalId,
      weeklySchedule: availabilityData.weeklySchedule,
    });
  } catch (error) {
    console.error("Error updating professional availability:", error);
    return NextResponse.json(
      { error: "Error al actualizar horarios" },
      { status: 500 }
    );
  }
}
