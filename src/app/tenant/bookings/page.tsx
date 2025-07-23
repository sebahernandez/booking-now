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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Clock, DollarSign, Check, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  totalPrice: number;
  notes?: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    name: string;
    duration: number;
  };
  professional?: {
    user: {
      name: string;
    };
  };
}

export default function TenantBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/tenant/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { label: "Confirmada", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      COMPLETED: { label: "Completada", className: "bg-blue-100 text-blue-700 border-blue-200" },
      PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-700 border-amber-200" },
      CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700 border-red-200" },
      NO_SHOW: { label: "No asistió", className: "bg-gray-100 text-gray-700 border-gray-200" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: "bg-gray-100 text-gray-700 border-gray-200" 
    };
  };


  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tenant/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
      } else {
        console.error("Error updating booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Reservas
        </h1>
        <p className="text-gray-600 text-lg">
          Administra todas las reservas de tus clientes
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking, index) => {
            const statusBadge = getStatusBadge(booking.status);
            return (
              <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {booking.client.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {booking.client.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {booking.client.email}
                          {booking.client.phone && ` • ${booking.client.phone}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn("text-xs font-medium border", statusBadge.className)}
                    >
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Servicio */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Servicio</p>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{booking.service.name}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {booking.service.duration} minutos
                        </p>
                      </div>
                    </div>

                    {/* Profesional */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Profesional</p>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">
                          {booking.professional?.user.name || "Sin asignar"}
                        </p>
                      </div>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Fecha y Hora</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-gray-900">
                            {format(new Date(booking.startDateTime), "PPP", { locale: es })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.startDateTime), "HH:mm")} - {" "}
                            {format(new Date(booking.endDateTime), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Precio</p>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <p className="font-semibold text-emerald-600 text-lg">
                          ${booking.totalPrice.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Notas</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                    {booking.status === "PENDING" && (
                      <>
                        <Button 
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleUpdateBookingStatus(booking.id, "COMPLETED")}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Completar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleUpdateBookingStatus(booking.id, "NO_SHOW")}
                        >
                          No asistió
                        </Button>
                      </>
                    )}
                    {(booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "NO_SHOW") && (
                      <div className="text-sm text-gray-500 font-medium">
                        Reserva finalizada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay reservas aún
            </h3>
            <p className="text-gray-500 text-center text-lg max-w-md">
              Cuando tus clientes hagan reservas, aparecerán aquí
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}