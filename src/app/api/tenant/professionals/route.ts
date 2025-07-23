import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const professionals = await prisma.professional.findMany({
      where: {
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
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("Error fetching tenant professionals:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone, bio, hourlyRate, services } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      );
    }

    // Use transaction to create user and professional
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || "",
          role: "PROFESSIONAL",
          tenantId: session.user.tenantId,
        },
      });

      // Create professional profile
      const professional = await tx.professional.create({
        data: {
          userId: user.id,
          tenantId: session.user.tenantId,
          bio: bio || "",
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
          isAvailable: true,
        },
      });

      // Create professional-service relationships if services provided
      if (services && Array.isArray(services)) {
        await tx.professionalService.createMany({
          data: services.map((serviceId: string) => ({
            professionalId: professional.id,
            serviceId,
          })),
        });
      }

      return professional;
    });

    // Fetch the complete professional data
    const completeProfessional = await prisma.professional.findUnique({
      where: { id: result.id },
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

    return NextResponse.json(completeProfessional, { status: 201 });
  } catch (error) {
    console.error("Error creating professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get("id");

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID del profesional es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el profesional pertenece al tenant
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        tenantId: session.user.tenantId,
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay reservas asociadas
    const bookingsCount = await prisma.booking.count({
      where: {
        professionalId: professionalId,
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

    // Eliminar relaciones con servicios primero
    await prisma.professionalService.deleteMany({
      where: {
        professionalId: professionalId,
      },
    });

    // Eliminar el profesional
    await prisma.professional.delete({
      where: {
        id: professionalId,
      },
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
