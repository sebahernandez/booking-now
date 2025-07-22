import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateTime = searchParams.get("startDateTime");
    const endDateTime = searchParams.get("endDateTime");
    const professionalId = searchParams.get("professionalId");
    const serviceId = searchParams.get("serviceId");

    if (!startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: "startDateTime and endDateTime are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // Check for overlapping bookings
    const whereCondition = {
      startDateTime: {
        lt: endDate,
      },
      endDateTime: {
        gt: startDate,
      },
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      ...(professionalId && professionalId !== "any" && { professionalId }),
      ...(serviceId && { serviceId }),
    };

    const existingBooking = await prisma.booking.findFirst({
      where: whereCondition,
    });

    const isAvailable = !existingBooking;

    return NextResponse.json({
      isAvailable,
      ...(existingBooking && {
        conflictingBooking: {
          id: existingBooking.id,
          startDateTime: existingBooking.startDateTime,
          endDateTime: existingBooking.endDateTime,
          status: existingBooking.status,
        },
      }),
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
