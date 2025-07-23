import { NextResponse } from "next/server";
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

    const tenantId = session.user.tenantId;

    // Get tenant stats
    const [
      totalServices,
      totalProfessionals,
      totalBookings,
      thisMonthBookings,
      recentBookings,
      totalRevenue,
    ] = await Promise.all([
      // Total services
      prisma.service.count({
        where: { tenantId, isActive: true },
      }),

      // Total professionals
      prisma.professional.count({
        where: { tenantId, isAvailable: true },
      }),

      // Total bookings
      prisma.booking.count({
        where: { tenantId },
      }),

      // This month bookings
      prisma.booking.count({
        where: {
          tenantId,
          startDateTime: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
        },
      }),

      // Recent bookings
      prisma.booking
        .findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            client: {
              select: { name: true, email: true },
            },
            service: {
              select: { name: true },
            },
            professional: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        })
        .catch((error) => {
          console.error("Error fetching recent bookings:", error);
          return [];
        }),

      // Total revenue
      prisma.booking.aggregate({
        where: {
          tenantId,
          status: { in: ["COMPLETED", "CONFIRMED"] },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    // Format recent bookings
    const formattedRecentBookings =
      recentBookings?.map((booking) => ({
        id: booking.id,
        clientName: booking.client?.name || booking.client?.email || "Cliente",
        serviceName: booking.service?.name || "Servicio",
        professionalName: booking.professional?.user?.name || "Sin asignar",
        startDateTime: booking.startDateTime.toISOString(),
        status: booking.status,
      })) || [];

    const stats = {
      totalServices: totalServices || 0,
      totalProfessionals: totalProfessionals || 0,
      totalBookings: totalBookings || 0,
      thisMonthBookings: thisMonthBookings || 0,
      totalRevenue: totalRevenue?._sum?.totalPrice || 0,
      recentBookings: formattedRecentBookings,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching tenant dashboard stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
