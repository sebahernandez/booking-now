import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!session.user.isTenant) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { name, phone } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Update tenant profile
    const updatedTenant = await prisma.tenant.update({
      where: {
        id: session.user.tenantId,
      },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        email: updatedTenant.email,
        phone: updatedTenant.phone,
      },
    });
  } catch (error) {
    console.error("Error updating tenant profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}