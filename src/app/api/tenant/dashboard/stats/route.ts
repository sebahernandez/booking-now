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
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Obtener bookings del tenant agrupados por mes
    const monthlyBookings = await prisma.booking.groupBy({
      by: ['startDateTime'],
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      where: {
        tenantId,
        startDateTime: {
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
        const bookingMonth = booking.startDateTime.getMonth() + 1;
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

    // Ingresos solo de bookings confirmados y completados
    const confirmedRevenueByMonth = await prisma.booking.groupBy({
      by: ['startDateTime'],
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      },
      where: {
        tenantId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startDateTime: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    const confirmedRevenueData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthName = new Date(currentYear, index, 1).toLocaleDateString('es-ES', { month: 'short' });
      
      const monthRevenue = confirmedRevenueByMonth.filter(booking => {
        const bookingMonth = booking.startDateTime.getMonth() + 1;
        return bookingMonth === month;
      });

      const totalRevenue = monthRevenue.reduce((sum, booking) => sum + (booking._sum.totalPrice || 0), 0);
      const totalBookings = monthRevenue.reduce((sum, booking) => sum + booking._count.id, 0);

      return {
        month: monthName,
        revenue: totalRevenue,
        bookings: totalBookings
      };
    });

    // Estadísticas por servicio
    const serviceStats = await prisma.booking.groupBy({
      by: ['serviceId'],
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      where: {
        tenantId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startDateTime: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    // Obtener nombres de servicios
    const services = await prisma.service.findMany({
      where: {
        tenantId,
        id: {
          in: serviceStats.map(stat => stat.serviceId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const serviceDistribution = serviceStats.map(stat => {
      const service = services.find(s => s.id === stat.serviceId);
      return {
        name: service?.name || 'Servicio desconocido',
        bookings: stat._count.id,
        revenue: stat._sum.totalPrice || 0
      };
    });

    // Estadísticas por profesional
    const professionalStats = await prisma.booking.groupBy({
      by: ['professionalId'],
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      where: {
        tenantId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startDateTime: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      }
    });

    // Obtener nombres de profesionales
    const professionals = await prisma.professional.findMany({
      where: {
        tenantId,
        id: {
          in: professionalStats.map(stat => stat.professionalId).filter(id => id !== null)
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    const professionalDistribution = professionalStats
      .filter(stat => stat.professionalId !== null)
      .map(stat => {
        const professional = professionals.find(p => p.id === stat.professionalId);
        return {
          name: professional?.user?.name || 'Profesional desconocido',
          bookings: stat._count.id,
          revenue: stat._sum.totalPrice || 0
        };
      });

    // Métricas de rendimiento
    const thisMonth = new Date(currentYear, currentDate.getMonth(), 1);
    const nextMonth = new Date(currentYear, currentDate.getMonth() + 1, 1);

    const thisMonthStats = await prisma.booking.aggregate({
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      where: {
        tenantId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startDateTime: {
          gte: thisMonth,
          lt: nextMonth
        }
      }
    });

    const totalConfirmedRevenue = await prisma.booking.aggregate({
      _sum: {
        totalPrice: true
      },
      where: {
        tenantId,
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    });

    const statsData = {
      monthlyBookings: monthlyData,
      confirmedRevenue: confirmedRevenueData,
      serviceDistribution,
      professionalDistribution,
      performance: {
        thisMonthBookings: thisMonthStats._count.id,
        thisMonthRevenue: thisMonthStats._sum.totalPrice || 0,
        totalConfirmedRevenue: totalConfirmedRevenue._sum.totalPrice || 0
      }
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Error fetching tenant dashboard stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}