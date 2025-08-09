"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Code,
  ExternalLink,
  Plus,
  CalendarPlus,
  Eye,
} from "lucide-react";
import RecentBookingsTable from "@/components/tenant/recent-bookings-table";
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/tenant/book">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <CalendarPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                    Agendar Nueva Cita
                  </h3>
                  <p className="text-sm text-gray-600">
                    Crear una nueva reserva para un cliente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/bookings">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                    Ver Reservas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gestionar todas las citas programadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/services">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
                    Gestionar Servicios
                  </h3>
                  <p className="text-sm text-gray-600">
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
        {/* Placeholder for future tools */}
        <div className="lg:col-span-2">
          {/* Recent Activity will go here */}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <RecentBookingsTable
        showTitle={true}
        maxHeight="500px"
      />
    </div>
  );
}
