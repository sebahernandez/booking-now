"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import "react-calendar/dist/Calendar.css";

interface Booking {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  totalPrice: number;
  notes?: string;
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  professional: {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusLabels = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export default function AdminBookingsPage() {
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error("Error fetching bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filterBookingsByDate = () => {
      let filtered = bookings;

      // Filter by selected date
      if (selectedDate && selectedDate instanceof Date) {
        const selectedDateString = format(selectedDate, "yyyy-MM-dd");
        filtered = bookings.filter((booking) => {
          const bookingDate = format(
            new Date(booking.startDateTime),
            "yyyy-MM-dd"
          );
          return bookingDate === selectedDateString;
        });
      }

      // Filter by status
      if (selectedStatus !== "ALL") {
        filtered = filtered.filter(
          (booking) => booking.status === selectedStatus
        );
      }

      setFilteredBookings(filtered);
    };

    filterBookingsByDate();
  }, [selectedDate, bookings, selectedStatus]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh bookings
        fetchBookings();
      } else {
        console.error("Error updating booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = format(date, "yyyy-MM-dd");
      const dayBookings = bookings.filter((booking) => {
        const bookingDate = format(
          new Date(booking.startDateTime),
          "yyyy-MM-dd"
        );
        return bookingDate === dateString;
      });

      if (dayBookings.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateString = format(date, "yyyy-MM-dd");
      const dayBookings = bookings.filter((booking) => {
        const bookingDate = format(
          new Date(booking.startDateTime),
          "yyyy-MM-dd"
        );
        return bookingDate === dateString;
      });

      if (dayBookings.length > 0) {
        return "has-bookings";
      }
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Reservas
          </h1>
          <p className="text-gray-600 mt-2">
            Administra y visualiza todas las reservas en el calendario
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendario</span>
              </CardTitle>
              <CardDescription>
                Selecciona una fecha para ver las reservas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="es-ES"
                  tileContent={getTileContent}
                  tileClassName={getTileClassName}
                  className="w-full"
                />
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Días con reservas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Reservas{" "}
                  {selectedDate instanceof Date &&
                    `del ${format(selectedDate, "dd/MM/yyyy", { locale: es })}`}
                </CardTitle>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendientes</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                    <SelectItem value="CANCELLED">Canceladas</SelectItem>
                    <SelectItem value="COMPLETED">Completadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                {filteredBookings.length} reserva
                {filteredBookings.length !== 1 ? "s" : ""} encontrada
                {filteredBookings.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Cargando reservas...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reservas para la fecha seleccionada</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">
                              {booking.service.name}
                            </h3>
                            <Badge
                              className={
                                statusColors[
                                  booking.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {
                                statusLabels[
                                  booking.status as keyof typeof statusLabels
                                ]
                              }
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>
                                  {booking.client.name || "Sin nombre"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {booking.client.email}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                  {format(
                                    new Date(booking.startDateTime),
                                    "HH:mm"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(booking.endDateTime),
                                    "HH:mm"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span>${booking.totalPrice}</span>
                              </div>
                            </div>
                          </div>

                          {booking.professional && (
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>
                                Profesional: {booking.professional.user.name}
                              </span>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Notas:</strong> {booking.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.status === "PENDING" && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "CONFIRMED")
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateBookingStatus(booking.id, "CANCELLED")
                            }
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "COMPLETED")
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Marcar como completada
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateBookingStatus(booking.id, "CANCELLED")
                            }
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar {
          width: 100% !important;
          background: white;
          border: 1px solid #e5e7eb;
          font-family: inherit;
        }

        .react-calendar__tile {
          position: relative;
          background: none;
          border: none;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
        }

        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }

        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
