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
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Mi Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/tenant/book">
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:from-blue-100/60 hover:to-indigo-100/60 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100/80 dark:bg-blue-900/50 rounded-xl group-hover:bg-blue-200/80 dark:group-hover:bg-blue-800/50 transition-colors">
                  <CalendarPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors">
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
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/50 dark:to-emerald-950/50 hover:from-green-100/60 hover:to-emerald-100/60 dark:hover:from-green-900/60 dark:hover:to-emerald-900/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100/80 dark:bg-green-900/50 rounded-xl group-hover:bg-green-200/80 dark:group-hover:bg-green-800/50 transition-colors">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-green-900 dark:group-hover:text-green-300 transition-colors">
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
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/50 dark:to-violet-950/50 hover:from-purple-100/60 hover:to-violet-100/60 dark:hover:from-purple-900/60 dark:hover:to-violet-900/60">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100/80 dark:bg-purple-900/50 rounded-xl group-hover:bg-purple-200/80 dark:group-hover:bg-purple-800/50 transition-colors">
                  <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", card.bgColor)}>
                    <Icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
                </div>
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
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Métricas de Rendimiento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reservas Confirmadas Este Mes</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {advancedStats?.performance?.thisMonthBookings || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ingresos Este Mes</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      ${(advancedStats?.performance?.thisMonthRevenue || 0).toLocaleString("es-CL")}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Ingresos Confirmados</span>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      ${(advancedStats?.performance?.totalConfirmedRevenue || 0).toLocaleString("es-CL")}
                    </span>
                  </div>
                </CardContent>
              </Card>
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
