"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Activity,
  Code,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

export default function TenantDashboard() {
  useSession();
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantStats();
  }, []);

  const fetchTenantStats = async () => {
    try {
      const response = await fetch("/api/tenant/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching tenant stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: {
        label: "Confirmada",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      },
      COMPLETED: {
        label: "Completada",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      PENDING: {
        label: "Pendiente",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      },
      CANCELLED: {
        label: "Cancelada",
        className: "bg-red-100 text-red-700 border-red-200",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className: "bg-gray-100 text-gray-700 border-gray-200",
      }
    );
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
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Mi Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Bienvenido a tu panel de control
        </p>
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
                  <h3 className="text-sm font-medium text-gray-600">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Widget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Widget de Reservas</CardTitle>
                <CardDescription>
                  Integra el sistema en tu sitio web
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Obtén el código para integrar tu sistema de reservas en
                cualquier sitio web.
              </p>
              <Link
                href="/tenant/widget"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors gap-2"
              >
                <Code className="h-4 w-4" />
                Obtener Código
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future tools */}
        <div className="lg:col-span-2">
          {/* Recent Activity will go here */}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Reservas Recientes
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Últimas reservas en tu sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentBookings?.length ? (
            <div className="space-y-4">
              {stats.recentBookings.map((booking, index) => {
                const statusBadge = getStatusBadge(booking.status);
                return (
                  <div
                    key={booking.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200",
                      index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {booking.clientName.charAt(0)}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.clientName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.serviceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Con {booking.professionalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.startDateTime).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium border",
                        statusBadge.className
                      )}
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
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay reservas aún
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                Cuando tengas reservas, aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
