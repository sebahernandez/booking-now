import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, professionalId, startDateTime, endDateTime, notes } = body;

    // Verify booking exists and belongs to the tenant
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (professionalId !== undefined)
      updateData.professionalId = professionalId;
    if (startDateTime !== undefined)
      updateData.startDateTime = new Date(startDateTime);
    if (endDateTime !== undefined)
      updateData.endDateTime = new Date(endDateTime);
    if (notes !== undefined) updateData.notes = notes;

    // If updating time, check for conflicts
    if (startDateTime && endDateTime) {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          id: { not: id },
          tenantId: session.user.tenantId,
          serviceId: existingBooking.serviceId,
          ...(professionalId && { professionalId }),
          startDateTime: {
            lt: new Date(endDateTime),
          },
          endDateTime: {
            gt: new Date(startDateTime),
          },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          { error: "El horario seleccionado ya está ocupado" },
          { status: 409 }
        );
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify booking exists and belongs to the tenant
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Delete the booking completely
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Reserva eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
