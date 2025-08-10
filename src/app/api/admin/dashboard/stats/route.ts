import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener estadísticas de bookings por mes para el año actual
    const monthlyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    // Procesar datos por mes
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthName = new Date(currentYear, index, 1).toLocaleDateString('es-ES', { month: 'short' });
      
      // Filtrar bookings del mes actual
      const monthBookings = monthlyBookings.filter(booking => {
        const bookingMonth = booking.createdAt.getMonth() + 1;
        return bookingMonth === month;
      });

      const totalBookings = monthBookings.reduce((sum, booking) => sum + booking._count.id, 0);
      const totalRevenue = monthBookings.reduce((sum, booking) => sum + (booking._sum.totalPrice || 0), 0);

      return {
        month: monthName,
        bookings: totalBookings,
        revenue: totalRevenue
      };
    });

    // Estadísticas de tenants por mes (registros)
    const tenantRegistrations = await prisma.tenant.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    const tenantGrowthData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthName = new Date(currentYear, index, 1).toLocaleDateString('es-ES', { month: 'short' });
      
      const monthTenants = tenantRegistrations.filter(tenant => {
        const tenantMonth = tenant.createdAt.getMonth() + 1;
        return tenantMonth === month;
      });

      const totalRegistrations = monthTenants.reduce((sum, tenant) => sum + tenant._count.id, 0);

      return {
        month: monthName,
        tenants: totalRegistrations
      };
    });

    // Estadísticas de usuarios por tenant
    const tenantUserStats = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      take: 10,
      orderBy: {
        users: {
          _count: 'desc'
        }
      }
    });

    const tenantDistribution = tenantUserStats.map(tenant => ({
      name: tenant.name,
      users: tenant._count.users
    }));

    // Estadísticas generales del sistema
    const totalBookingsThisYear = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    const totalRevenueThisYear = await prisma.booking.aggregate({
      _sum: {
        totalPrice: true
      },
      where: {
        status: { in: ["COMPLETED", "CONFIRMED"] },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    const statsData = {
      monthlyBookings: monthlyData,
      tenantGrowth: tenantGrowthData,
      tenantDistribution,
      summary: {
        totalBookingsThisYear,
        totalRevenueThisYear: totalRevenueThisYear._sum.totalPrice || 0
      }
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas avanzadas" },
      { status: 500 }
    );
  }
}