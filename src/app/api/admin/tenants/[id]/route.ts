import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, email, phone, password, isActive } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "El nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el email ya existe en otro tenant
    const emailConflict = await prisma.tenant.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (emailConflict) {
      return NextResponse.json(
        { error: "Ya existe otro cliente con este email" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      name,
      email,
      phone: phone || null,
      isActive: isActive ?? true,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Verificar si el tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            professionals: true,
            services: true,
            bookings: true,
          },
        },
      },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene datos relacionados
    const hasRelatedData =
      (existingTenant._count?.users || 0) > 0 ||
      (existingTenant._count?.professionals || 0) > 0 ||
      (existingTenant._count?.services || 0) > 0 ||
      (existingTenant._count?.bookings || 0) > 0;
    if (hasRelatedData) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el cliente porque tiene usuarios, profesionales, servicios o reservas asociadas. Primero debes desactivarlo.",
        },
        { status: 400 }
      );
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
