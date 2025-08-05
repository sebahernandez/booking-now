import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = context.params;

    // Buscar el tenant con sus servicios y profesionales
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
        isActive: true, // Solo tenants activos
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
          },
        },
        professionals: {
          where: {
            isAvailable: true,
          },
          select: {
            id: true,
            bio: true,
            hourlyRate: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Formatear la respuesta para el widget
    const widgetData = {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      services: tenant.services,
      professionals: tenant.professionals,
    };

    return NextResponse.json(widgetData);
  } catch (error) {
    console.error("Error fetching tenant data for widget:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
