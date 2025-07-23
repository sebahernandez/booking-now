import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const { searchParams } = new URL(request.url);

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

    // Buscar reservas existentes que se superpongan con el tiempo solicitado
    const existingBookings = await prisma.booking.findMany({
      where: {
        tenantId: tenantId,
        AND: [
          {
            OR: [
              // La reserva existente comienza antes y termina después del inicio solicitado
              {
                startDateTime: { lte: startDate },
                endDateTime: { gt: startDate },
              },
              // La reserva existente comienza antes del final solicitado y termina después
              {
                startDateTime: { lt: endDate },
                endDateTime: { gte: endDate },
              },
              // La reserva existente está completamente contenida en el rango solicitado
              {
                startDateTime: { gte: startDate },
                endDateTime: { lte: endDate },
              },
            ],
          },
          {
            status: {
              in: ["PENDING", "CONFIRMED"], // Solo considerar reservas activas
            },
          },
        ],
        // Si se especifica un profesional, verificar solo sus reservas
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
  } catch (error) {
    console.error("Error checking availability for widget:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
