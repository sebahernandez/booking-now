import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id, scheduleId } = await params;

    // Verificar que el servicio pertenece al tenant
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

    // Verificar que el horario existe y pertenece al servicio
    const schedule = await prisma.serviceAvailability.findFirst({
      where: {
        id: scheduleId,
        serviceId: id,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el horario
    await prisma.serviceAvailability.delete({
      where: {
        id: scheduleId,
      },
    });

    return NextResponse.json({ message: "Horario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
