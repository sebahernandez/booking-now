import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
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

    // Obtener notificaciones del tenant ordenadas por fecha (más recientes primero)
    const notifications = await prisma.$queryRaw`
      SELECT 
        id, 
        type, 
        title, 
        message, 
        read, 
        "createdAt",
        "bookingId"
      FROM notifications 
      WHERE "tenantId" = ${tenantId}
      ORDER BY "createdAt" DESC
      LIMIT 50
    ` as any[];

    // Formatear las notificaciones para el frontend
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.read,
      bookingId: notification.bookingId,
      clientName: null, // Por ahora sin join
      serviceName: null, // Por ahora sin join
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { bookingId, type, title, message } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    await createNotification({
      tenantId,
      bookingId,
      type,
      title,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
