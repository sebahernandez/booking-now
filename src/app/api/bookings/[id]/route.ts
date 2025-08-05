import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user?.role === "ADMIN" || session.user?.isTenant)
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "El estado es requerido" },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to the tenant (if tenant user)
    const whereClause = { id };

    const existingBooking = await prisma.booking.findUnique({
      where: whereClause,
    });

    if (
      !existingBooking ||
      (session.user?.isTenant &&
        session.user?.tenantId &&
        existingBooking.tenantId !== session.user.tenantId)
    ) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: { name: true, email: true, phone: true },
        },
        service: {
          select: { name: true, duration: true },
        },
        professional: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
