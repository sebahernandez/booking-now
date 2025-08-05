import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, price, duration } = body;

    // Verify service exists and belongs to the tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
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

    // Verify service exists and belongs to the tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Check if service has any bookings (regardless of status)
    const bookingsCount = await prisma.booking.count({
      where: {
        serviceId: id,
      },
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un servicio que tiene reservas asociadas",
        },
        { status: 400 }
      );
    }

    // Delete the service completely
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting service:", error);
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

    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
