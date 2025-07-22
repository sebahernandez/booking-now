import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Service API PUT error:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if service has bookings that prevent deletion (exclude cancelled bookings)
    const blockingBookings = await prisma.booking.count({
      where: {
        serviceId: id,
        status: {
          in: ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"], // Allow deletion only if all bookings are cancelled
        },
      },
    });

    if (blockingBookings > 0) {
      // Get details about the blocking bookings for better error message
      const bookingStatuses = await prisma.booking.groupBy({
        by: ["status"],
        where: {
          serviceId: id,
          status: {
            in: ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"],
          },
        },
        _count: {
          status: true,
        },
      });

      const statusDetails = bookingStatuses
        .map((group) => `${group._count.status} ${group.status.toLowerCase()}`)
        .join(", ");

      return NextResponse.json(
        {
          error: "No se puede eliminar un servicio que tiene reservas activas",
          details: `El servicio tiene reservas no canceladas: ${statusDetails}. Solo se pueden eliminar servicios con todas las reservas canceladas.`,
        },
        { status: 400 }
      );
    }

    // Count cancelled bookings that will be deleted
    const cancelledBookingsCount = await prisma.booking.count({
      where: {
        serviceId: id,
        status: "CANCELLED",
      },
    });

    // Delete service and its relationships in a transaction
    await prisma.$transaction(async (tx) => {
      // First, delete all cancelled bookings for this service
      // (we allow deletion only if all non-cancelled bookings don't exist)
      await tx.booking.deleteMany({
        where: {
          serviceId: id,
          status: "CANCELLED",
        },
      });

      // Then, delete all professional-service relationships
      await tx.professionalService.deleteMany({
        where: { serviceId: id },
      });

      // Finally, delete the service
      await tx.service.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Servicio eliminado exitosamente",
      details:
        cancelledBookingsCount > 0
          ? `Se eliminaron también ${cancelledBookingsCount} reserva(s) cancelada(s) y todas las relaciones asociadas al servicio`
          : "Se eliminaron todas las relaciones asociadas al servicio",
    });
  } catch (error) {
    console.error("Service API DELETE error:", error);
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 }
    );
  }
}
