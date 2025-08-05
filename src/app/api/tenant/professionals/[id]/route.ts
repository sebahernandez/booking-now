import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await request.json();
    const { name, email, phone, password, bio, hourlyRate, isAvailable, services } = body;

    // Verify professional exists and belongs to the tenant
    const existingProfessional = await prisma.professional.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        user: true,
      },
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Use transaction to update user and professional data
    await prisma.$transaction(async (tx) => {
      // Update user data if provided
      const userUpdateData: Record<string, unknown> = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) userUpdateData.email = email;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (password !== undefined && password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingProfessional.userId },
          data: userUpdateData,
        });
      }

      // Update professional data if provided
      const professionalUpdateData: Record<string, unknown> = {};
      if (bio !== undefined) professionalUpdateData.bio = bio;
      if (hourlyRate !== undefined)
        professionalUpdateData.hourlyRate = parseFloat(hourlyRate);
      if (isAvailable !== undefined)
        professionalUpdateData.isAvailable = isAvailable;

      if (Object.keys(professionalUpdateData).length > 0) {
        await tx.professional.update({
          where: { id },
          data: professionalUpdateData,
        });
      }

      // Update services if provided
      if (services && Array.isArray(services)) {
        // Remove existing service relationships
        await tx.professionalService.deleteMany({
          where: { professionalId: id },
        });

        // Create new service relationships
        if (services.length > 0) {
          await tx.professionalService.createMany({
            data: services.map((serviceId: string) => ({
              professionalId: id,
              serviceId,
            })),
          });
        }
      }

      return true;
    });

    // Fetch updated professional data
    const updatedProfessional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedProfessional);
  } catch (error) {
    console.error("Error updating professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = context.params;

    // Verify professional exists and belongs to the tenant
    const existingProfessional = await prisma.professional.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingProfessional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Check if professional has any bookings (regardless of status)
    const bookingsCount = await prisma.booking.count({
      where: {
        professionalId: id,
      },
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un profesional que tiene reservas asociadas",
        },
        { status: 400 }
      );
    }

    // Delete professional service relationships first
    await prisma.professionalService.deleteMany({
      where: { professionalId: id },
    });

    // Delete the professional completely
    await prisma.professional.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Profesional eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const { id } = context.params;

    const professional = await prisma.professional.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error("Error fetching professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
