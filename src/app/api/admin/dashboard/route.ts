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

    // Get admin dashboard statistics - only tenants and users
    let totalTenants = 0;
    let activeTenants = 0;
    let totalUsers = 0;
    let recentTenants: Array<{
      id: string;
      name: string;
      email: string;
      isActive: boolean;
      createdAt: Date;
    }> = [];

    try {
      const results = await Promise.allSettled([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.tenant.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        }),
      ]);

      totalTenants = results[0].status === "fulfilled" ? results[0].value : 0;
      activeTenants = results[1].status === "fulfilled" ? results[1].value : 0;
      totalUsers = results[2].status === "fulfilled" ? results[2].value : 0;
      recentTenants = results[3].status === "fulfilled" ? results[3].value : [];
    } catch (error) {
      console.error("Database query error:", error);
      // Continue with default values
    }

    const dashboardData = {
      totalTenants,
      activeTenants,
      totalUsers,
      recentTenants: recentTenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas del dashboard" },
      { status: 500 }
    );
  }
}
