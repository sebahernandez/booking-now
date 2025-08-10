"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Plus,
  CalendarPlus,
  Eye,
  Clock,
} from "lucide-react";
import RecentBookingsTable from "@/components/tenant/recent-bookings-table";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ShadcnPieChart from "@/components/charts/ShadcnPieChart";
import ShadcnBarChart from "@/components/charts/ShadcnBarChart";
import ShadcnAreaChart from "@/components/charts/ShadcnAreaChart";

interface TenantStats {
  totalServices: number;
  totalProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  thisMonthBookings: number;
  recentBookings: Array<{
    id: string;
    clientName: string;
    serviceName: string;
    professionalName: string;
    startDateTime: string;
    status: string;
  }>;
}

interface TenantAdvancedStats {
  monthlyBookings: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  confirmedRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  serviceDistribution: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  professionalDistribution: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  performance: {
    thisMonthBookings: number;
    thisMonthRevenue: number;
    totalConfirmedRevenue: number;
  };
}

export default function TenantDashboard() {
  useSession();
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<TenantAdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantStats();
  }, []);

  const fetchTenantStats = async () => {
    try {
      const [basicResponse, advancedResponse] = await Promise.all([
        fetch("/api/tenant/dashboard"),
        fetch("/api/tenant/dashboard/stats")
      ]);

      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        setStats(basicData);
      }

      if (advancedResponse.ok) {
        const advancedData = await advancedResponse.json();
        setAdvancedStats(advancedData);
      }
    } catch (error) {
      console.error("Error fetching tenant stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Mis Servicios",
      value: stats?.totalServices || 0,
      description: "Servicios disponibles",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Mis Profesionales",
      value: stats?.totalProfessionals || 0,
      description: "Profesionales activos",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Reservas Este Mes",
      value: stats?.thisMonthBookings || 0,
      description: `+${Math.round(
        ((stats?.thisMonthBookings || 0) / (stats?.totalBookings || 1)) * 100
      )}% del total`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ingresos Totales",
      value: `$${(stats?.totalRevenue || 0).toLocaleString("es-CL")}`,
      description: "Ingresos acumulados",
      icon: DollarSign,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Mi Dashboard
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/tenant/book">
          <Card className="transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <CalendarPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Agendar Nueva Cita
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Crear una nueva reserva para un cliente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/bookings">
          <Card className="transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Ver Reservas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gestionar todas las citas programadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/services">
          <Card className="transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Gestionar Servicios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configurar servicios y disponibilidad
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShadcnAreaChart
          data={advancedStats?.monthlyBookings?.map(item => ({
            name: item.month,
            value: item.bookings
          })) || []}
          title="Evolución de Reservas"
          description="Número de reservas registradas por mes"
          color="hsl(142 70% 45%)"
        />
        
        <ShadcnPieChart
          data={advancedStats?.serviceDistribution?.slice(0, 5).map(item => ({
            name: item.name,
            value: item.bookings
          })) || []}
          title="Reservas por Servicio"
          description="Distribución de reservas entre tus servicios"
          colors={[
            "hsl(220 70% 50%)",
            "hsl(42 96% 50%)",
            "hsl(142 70% 45%)",
            "hsl(0 84% 60%)",
            "hsl(271 70% 50%)"
          ]}
        />
      </div>

      {/* Revenue and Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShadcnBarChart
          data={advancedStats?.confirmedRevenue?.map(item => ({
            name: item.month,
            value: item.revenue
          })) || []}
          title="Ingresos Confirmados"
          description="Ingresos mensuales de reservas confirmadas"
          color="hsl(0 84% 60%)"
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Métricas de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reservas Confirmadas Este Mes</span>
                  <span className="text-2xl font-bold">
                    {advancedStats?.performance?.thisMonthBookings || 0}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ingresos Este Mes</span>
                  <span className="text-2xl font-bold">
                    ${(advancedStats?.performance?.thisMonthRevenue || 0).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ingresos Confirmados</span>
                  <span className="text-2xl font-bold">
                    ${(advancedStats?.performance?.totalConfirmedRevenue || 0).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <RecentBookingsTable
        showTitle={true}
        maxHeight="500px"
      />
    </div>
  );
}
