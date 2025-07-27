import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const startDateTime = searchParams.get("startDateTime");
    const endDateTime = searchParams.get("endDateTime");
    const professionalId = searchParams.get("professionalId");

    // Support both modes: specific time slot check or full day booked slots
    if (date && serviceId) {
      // Mode 1: Get all booked slots for a specific date and service
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      const bookedSlots = await prisma.booking.findMany({
        where: {
          tenantId: tenantId,
          serviceId: serviceId,
          startDateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        select: {
          startDateTime: true,
          service: {
            select: {
              duration: true,
            },
          },
        },
      });

      return NextResponse.json({
        bookedSlots: bookedSlots.map(booking => ({
          dateTime: booking.startDateTime.toISOString(),
          duration: booking.service.duration,
        })),
      });
    } else if (startDateTime && endDateTime) {
      // Mode 2: Check specific time slot availability (legacy mode)
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      const existingBookings = await prisma.booking.findMany({
        where: {
          tenantId: tenantId,
          AND: [
            {
              OR: [
                {
                  startDateTime: { lte: startDate },
                  endDateTime: { gt: startDate },
                },
                {
                  startDateTime: { lt: endDate },
                  endDateTime: { gte: endDate },
                },
                {
                  startDateTime: { gte: startDate },
                  endDateTime: { lte: endDate },
                },
              ],
            },
            {
              status: {
                in: ["PENDING", "CONFIRMED"],
              },
            },
          ],
          ...(professionalId && professionalId !== "any"
            ? { professionalId }
            : {}),
        },
      });

      const isAvailable = existingBookings.length === 0;

      return NextResponse.json({
        isAvailable,
        conflictingBookings: existingBookings.length,
        message: isAvailable
          ? "Time slot is available"
          : `${existingBookings.length} conflicting booking(s) found`,
      });
    } else {
      return NextResponse.json(
        { error: "Either (date and serviceId) or (startDateTime and endDateTime) are required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error checking availability for widget:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
