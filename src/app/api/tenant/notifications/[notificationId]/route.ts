import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID no encontrado" },
        { status: 400 }
      );
    }

    // Verificar que la notificación pertenece al tenant
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId: tenantId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // Marcar como leída
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID no encontrado" },
        { status: 400 }
      );
    }

    // Verificar que la notificación pertenece al tenant
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId: tenantId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la notificación
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
