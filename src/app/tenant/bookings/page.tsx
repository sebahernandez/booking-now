"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  User,
  Clock,
  DollarSign,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid3x3,
  List,
  CalendarDays,
  Eye,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
} from "date-fns";
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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Calendar logic
  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) =>
      isSameDay(parseISO(booking.startDateTime), date)
    );
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.client.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
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
      NO_SHOW: {
        label: "No asistió",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className: "bg-gray-100 text-gray-700 border-gray-200",
      }
    );
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string
  ) => {
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

  return (
    <div className="space-y-6">
      {/* Header Profesional */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Panel de Reservas
          </h1>
          <p className="text-gray-600">
            Gestiona todas las reservas con vista calendario profesional
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmada</SelectItem>
              <SelectItem value="COMPLETED">Completada</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex rounded-lg border p-1 bg-gray-50">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="px-3"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Calendario
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-3"
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <CalendarSkeleton />
      ) : (
        <>{viewMode === "calendar" ? <CalendarView /> : <ListView />}</>
      )}

      {/* Modal de Detalles de Reserva */}
      <BookingDetailsModal />
    </div>
  );

  // Modal de Detalles de Reserva
  function BookingDetailsModal() {
    if (!selectedBooking) return null;

    const statusBadge = getStatusBadge(selectedBooking.status);

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
              <span>Detalles de la Reserva</span>
              <Badge
                variant="secondary"
                className={cn("font-medium border", statusBadge.className)}
              >
                {statusBadge.label}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Información completa de la reserva
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cliente Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-semibold">
                    {selectedBooking.client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedBooking.client.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{selectedBooking.client.email}</span>
                    </div>
                    {selectedBooking.client.phone && (
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{selectedBooking.client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de la Reserva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha y Hora */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Fecha y Hora
                </h4>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600 font-md">Día:</p>
                      <p className="text-sm font-semibold text-blue-800">
                        {format(
                          parseISO(selectedBooking.startDateTime),
                          "PPPP",
                          {
                            locale: es,
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Horario
                      </p>
                      <p className="text-sm font-semibold text-blue-800">
                        {format(
                          parseISO(selectedBooking.startDateTime),
                          "HH:mm"
                        )}{" "}
                        -{" "}
                        {format(parseISO(selectedBooking.endDateTime), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicio */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  Servicio
                </h4>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Servicio
                      </p>
                      <p className="text-sm font-semibold text-purple-800">
                        {selectedBooking.service.name}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Duración</p>
                        <p className="font-semibold text-purple-800">
                          {selectedBooking.service.duration} minutos
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-600">Profesional</p>
                        <p className="font-semibold text-purple-800">
                          {selectedBooking.professional?.user.name ||
                            "Sin asignar"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 mr-3" />
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">
                      Precio Total
                    </p>
                    <p className="text-xl font-bold text-emerald-800">
                      {selectedBooking.totalPrice.toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-600 font-medium uppercase">
                    Estado de Pago
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {selectedBooking.status === "COMPLETED"
                      ? "Pagado"
                      : "Pendiente"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {selectedBooking.notes && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                  Notas Adicionales
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedBooking.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {selectedBooking.status === "PENDING" && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                    onClick={() => {
                      handleUpdateBookingStatus(
                        selectedBooking.id,
                        "CONFIRMED"
                      );
                      closeBookingModal();
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Reserva
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 flex items-center"
                    onClick={() => {
                      handleUpdateBookingStatus(
                        selectedBooking.id,
                        "CANCELLED"
                      );
                      closeBookingModal();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar Reserva
                  </Button>
                </>
              )}
              {selectedBooking.status === "CONFIRMED" && (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 flex items-center"
                    onClick={() => {
                      handleUpdateBookingStatus(
                        selectedBooking.id,
                        "COMPLETED"
                      );
                      closeBookingModal();
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar como Completada
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 flex items-center"
                    onClick={() => {
                      handleUpdateBookingStatus(
                        selectedBooking.id,
                        "CANCELLED"
                      );
                      closeBookingModal();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar Reserva
                  </Button>
                </>
              )}
              {(selectedBooking.status === "COMPLETED" ||
                selectedBooking.status === "CANCELLED" ||
                selectedBooking.status === "NO_SHOW") && (
                <div className="flex items-center text-gray-500 font-medium">
                  <Check className="w-4 h-4 mr-2" />
                  Reserva finalizada
                </div>
              )}
              <Button
                variant="outline"
                onClick={closeBookingModal}
                className="ms-auto"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Calendar View Component
  function CalendarView() {
    const calendarDays = getCalendarDays();
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Week Days Header */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const dayBookings = getBookingsForDate(day).filter((booking) => {
                if (statusFilter === "all") return true;
                return booking.status === statusFilter;
              });
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors",
                    !isCurrentMonth && "bg-gray-50 text-gray-400",
                    isToday && "bg-blue-50 border-2 border-blue-200"
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isToday && "text-blue-600"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => {
                      const statusColors = {
                        PENDING: "bg-amber-100 text-amber-800 border-amber-200",
                        CONFIRMED:
                          "bg-emerald-100 text-emerald-800 border-emerald-200",
                        COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
                        CANCELLED: "bg-red-100 text-red-800 border-red-200",
                        NO_SHOW: "bg-gray-100 text-gray-800 border-gray-200",
                      };

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity",
                            statusColors[
                              booking.status as keyof typeof statusColors
                            ] || statusColors.PENDING
                          )}
                          title={`${booking.client.name} - ${
                            booking.service.name
                          } - ${format(
                            parseISO(booking.startDateTime),
                            "HH:mm"
                          )}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingModal(booking);
                          }}
                        >
                          <div className="font-medium truncate">
                            {format(parseISO(booking.startDateTime), "HH:mm")}{" "}
                            {booking.client.name}
                          </div>
                          <div className="truncate opacity-75">
                            {booking.service.name}
                          </div>
                        </div>
                      );
                    })}

                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayBookings.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View Component (mejorada)
  function ListView() {
    const filteredBookings = getFilteredBookings();

    return (
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            return (
              <Card
                key={booking.id}
                className="shadow-sm border-0 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Client Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-semibold">
                          {booking.client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {booking.client.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {booking.client.email}
                              {booking.client.phone &&
                                ` • ${booking.client.phone}`}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-medium border",
                              statusBadge.className
                            )}
                          >
                            {statusBadge.label}
                          </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {format(
                                  parseISO(booking.startDateTime),
                                  "PPP",
                                  { locale: es }
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(
                                  parseISO(booking.startDateTime),
                                  "HH:mm"
                                )}{" "}
                                -{" "}
                                {format(parseISO(booking.endDateTime), "HH:mm")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {booking.service.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.professional?.user.name ||
                                  "Sin asignar"}{" "}
                                • {booking.service.duration}min
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-emerald-600">
                                {booking.totalPrice.toLocaleString("es-CL")}
                              </p>
                              <p className="text-xs text-gray-500">
                                Precio total
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-3">
                          {booking.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "CONFIRMED"
                                  )
                                }
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "CANCELLED"
                                  )
                                }
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "COMPLETED"
                                  )
                                }
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Completar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    "CANCELLED"
                                  )
                                }
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBookingModal(booking)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="shadow-sm border-0">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No hay reservas
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {statusFilter !== "all"
                  ? `No se encontraron reservas con el filtro aplicado`
                  : "Cuando tus clientes hagan reservas, aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Loading Skeleton
  function CalendarSkeleton() {
    return (
      <Card className="shadow-sm border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
}
