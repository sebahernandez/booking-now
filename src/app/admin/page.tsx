"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Globe, TrendingUp, Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import ShadcnPieChart from "@/components/charts/ShadcnPieChart";
import ShadcnBarChart from "@/components/charts/ShadcnBarChart";
import ShadcnAreaChart from "@/components/charts/ShadcnAreaChart";

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  recentTenants: Array<{
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

interface DashboardAdvancedStats {
  monthlyBookings: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  tenantGrowth: Array<{
    month: string;
    tenants: number;
  }>;
  tenantDistribution: Array<{
    name: string;
    users: number;
  }>;
  summary: {
    totalBookingsThisYear: number;
    totalRevenueThisYear: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<DashboardAdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError, showInfo } = useToast();

  const fetchDashboardStats = useCallback(async () => {
    try {
      const [basicResponse, advancedResponse] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/dashboard/stats")
      ]);

      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        setStats(basicData);
        showInfo(`Dashboard actualizado - ${basicData.totalTenants} clientes registrados`);
      } else {
        showError("Error al cargar las estadísticas básicas del dashboard");
      }

      if (advancedResponse.ok) {
        const advancedData = await advancedResponse.json();
        setAdvancedStats(advancedData);
      } else {
        showError("Error al cargar las estadísticas avanzadas del dashboard");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      showError("Error de conexión al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [showError, showInfo]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? { label: "Activo", className: "bg-emerald-100 text-emerald-700 border-emerald-200" }
      : { label: "Inactivo", className: "bg-gray-100 text-gray-700 border-gray-200" };
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
      title: "Total Clientes",
      value: stats?.totalTenants || 0,
      description: "Clientes registrados",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Clientes Activos",
      value: stats?.activeTenants || 0,
      description: "Clientes con acceso",
      icon: Globe,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Total Usuarios",
      value: stats?.totalUsers || 0,
      description: "Usuarios en el sistema",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Gestión de clientes y usuarios del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index} 
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    card.bgColor
                  )}>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShadcnAreaChart
          data={advancedStats?.tenantGrowth?.map(item => ({
            name: item.month,
            value: item.tenants
          })) || []}
          title="Crecimiento de Clientes"
          description="Nuevos clientes registrados por mes"
          color="hsl(220 70% 50%)"
        />
        
        <ShadcnPieChart
          data={[
            { name: "Activos", value: stats?.activeTenants || 0 },
            { name: "Inactivos", value: (stats?.totalTenants || 0) - (stats?.activeTenants || 0) },
          ]}
          title="Estado de Clientes"
          description="Distribución de clientes activos e inactivos"
          colors={["hsl(142 70% 45%)", "hsl(0 84% 60%)"]}
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShadcnBarChart
          data={advancedStats?.monthlyBookings?.map(item => ({
            name: item.month,
            value: item.bookings
          })) || []}
          title="Reservas por Mes"
          description="Total de reservas realizadas cada mes"
          color="hsl(271 70% 50%)"
        />
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen Anual
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reservas Este Año</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {advancedStats?.summary?.totalBookingsThisYear || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ingresos Este Año</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${(advancedStats?.summary?.totalRevenueThisYear || 0).toLocaleString("es-CL")}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasa de Activación</span>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {stats?.totalTenants ? Math.round((stats.activeTenants / stats.totalTenants) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Clientes Recientes
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Últimos clientes registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentTenants?.length ? (
            <div className="space-y-4">
              {stats.recentTenants.map((tenant, index) => {
                const statusBadge = getStatusBadge(tenant.isActive);
                return (
                  <div
                    key={tenant.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200",
                      index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {tenant.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {tenant.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Registrado: {new Date(tenant.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="secondary"
                      className={cn("text-xs font-medium border", statusBadge.className)}
                    >
                      {statusBadge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay clientes registrados
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                Cuando se registren clientes en el sistema, aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
