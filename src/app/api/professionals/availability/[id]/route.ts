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

    // In a real app, this would update the database
    console.log(
      "Updating availability for professional:",
      professionalId,
      availabilityData
    );

    // Return updated data
    return NextResponse.json({
      ...availabilityData,
      id: `availability_${professionalId}`,
      professionalId,
    });
  } catch (error) {
    console.error("Error updating professional availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
