"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/useToast";
import {
  BookingsCalendarLoadingSkeleton,
  BookingsListLoadingSkeleton,
} from "@/components/ui/loading-skeleton";

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
  
  // Debug log for bookings state changes
  useEffect(() => {
    console.log("📅 Bookings state changed:", bookings.length, "bookings", bookings);
  }, [bookings]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchBookings = useCallback(
    async (showToast = false) => {
      try {
        const response = await fetch("/api/tenant/bookings");
        if (response.ok) {
          const data = await response.json();
          console.log("📅 API Response:", data);
          
          // La API devuelve { bookings: [...], total, page, pageSize, totalPages }
          if (data && Array.isArray(data.bookings)) {
            console.log("📅 Setting bookings:", data.bookings.length, "bookings");
            console.log("📅 First booking:", data.bookings[0]);
            setBookings(data.bookings);
            if (showToast) {
              toast.showSuccess(`${data.bookings.length} reservas cargadas`);
            }
          } else if (Array.isArray(data)) {
            // Fallback para compatibilidad si la API devuelve directamente un array
            console.log("📅 Fallback: Setting bookings array:", data.length, "bookings");
            setBookings(data);
            if (showToast) {
              toast.showSuccess(`${data.length} reservas cargadas`);
            }
          } else {
            console.error("Data format not recognized:", data);
            setBookings([]);
            if (showToast) {
              toast.showError("Formato de datos inválido");
            }
          }
        } else {
          console.error("API response not OK:", response.status);
          setBookings([]);
          if (showToast) {
            toast.showError("Error al cargar las reservas");
          }
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
        if (showToast) {
          toast.showError("Error de conexión al cargar reservas");
        }
      } finally {
        setLoading(false);
      }
    },
    [toast] // Restauramos la dependencia de toast ya que ahora está estabilizada
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Calendar logic
  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getBookingsForDate = (date: Date) => {
    if (!Array.isArray(bookings)) {
      console.log("📅 No bookings array available");
      return [];
    }
    
    const filtered = bookings.filter((booking) => {
      const bookingDate = parseISO(booking.startDateTime);
      const isSame = isSameDay(bookingDate, date);
      return isSame;
    });
    
    if (filtered.length > 0) {
      console.log(`📅 Found ${filtered.length} bookings for date ${format(date, 'yyyy-MM-dd')}:`, filtered);
    }
    
    return filtered;
  };

  const getFilteredBookings = () => {
    if (!Array.isArray(bookings)) return [];
    let filtered = bookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.client?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          false ||
          booking.service?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          false
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

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const statusLabels = {
      CONFIRMED: "confirmada",
      COMPLETED: "completada",
      CANCELLED: "cancelada",
      NO_SHOW: "marcada como no asistió",
    };

    try {
      const response = await fetch(`/api/tenant/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.showSuccess(
          `Reserva ${statusLabels[newStatus as keyof typeof statusLabels]} exitosamente`
        );
        fetchBookings();
        closeBookingModal();
      } else {
        const error = await response.json();
        toast.showError(error.error || "Error al actualizar la reserva");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.showError("Error de conexión al actualizar reserva");
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
      NO_SHOW: {
        label: "No asistió",
        className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      }
    );
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string
  ) => {
    try {
      if (newStatus === "CANCELLED") {
        // For cancellation, delete the booking instead of updating status
        const response = await fetch(`/api/tenant/bookings/${bookingId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchBookings();
        } else {
          console.error("Error cancelling booking");
        }
      } else {
        // For other status updates, use the PUT method
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Panel de Reservas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
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
        viewMode === "calendar" ? (
          <BookingsCalendarLoadingSkeleton />
        ) : (
          <BookingsListLoadingSkeleton />
        )
      ) : (
        <>{viewMode === "calendar" ? <CalendarView /> : <ListView />}</>
      )}

      {/* Modal de Detalles de Reserva */}
      <BookingDetailsModal />
    </div>
  );

  // Modal de Detalles de Reserva - Versión Simplificada
  function BookingDetailsModal() {
    if (!selectedBooking) return null;

    const statusBadge = getStatusBadge(selectedBooking.status);

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white rounded-lg border shadow-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>

          {/* Header simplificado */}
          <div className="border-b bg-gray-50 dark:bg-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  Reserva #{selectedBooking.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {format(parseISO(selectedBooking.startDateTime), "PPP", {
                    locale: es,
                  })}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium mx-10",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Información del Servicio */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Detalles del servicio
              </h2>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBooking.service?.name || "Servicio desconocido"}
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedBooking.service?.duration || 0} min
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(parseISO(selectedBooking.startDateTime), "HH:mm")}{" "}
                      - {format(parseISO(selectedBooking.endDateTime), "HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>
                      {selectedBooking.professional?.user.name || "Sin asignar"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Cliente</h2>
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedBooking.client?.name || "Cliente desconocido"}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedBooking.client?.email || "Email no disponible"}
                </div>
                {selectedBooking.client?.phone && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedBooking.client.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Precio</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-base font-semibold text-green-700 dark:text-green-400">
                    ${selectedBooking.totalPrice.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {selectedBooking.status === "COMPLETED"
                    ? "✓ Pagado"
                    : "⏳ Pendiente de pago"}
                </div>
              </div>
            </div>

            {/* Notas */}
            {selectedBooking.notes && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notas</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs text-amber-800">
                    {selectedBooking.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Acciones</h2>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                      onClick={() => {
                        handleUpdateBookingStatus(
                          selectedBooking.id,
                          "CONFIRMED"
                        );
                        closeBookingModal();
                      }}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50 text-xs px-3 py-1"
                      onClick={() => {
                        handleUpdateBookingStatus(
                          selectedBooking.id,
                          "CANCELLED"
                        );
                        closeBookingModal();
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </>
                )}

                {selectedBooking.status === "CONFIRMED" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                      onClick={() => {
                        handleUpdateBookingStatus(
                          selectedBooking.id,
                          "COMPLETED"
                        );
                        closeBookingModal();
                      }}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Completar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50 text-xs px-3 py-1"
                      onClick={() => {
                        handleUpdateBookingStatus(
                          selectedBooking.id,
                          "CANCELLED"
                        );
                        closeBookingModal();
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </>
                )}

                {(selectedBooking.status === "COMPLETED" ||
                  selectedBooking.status === "CANCELLED" ||
                  selectedBooking.status === "NO_SHOW") && (
                  <div className="flex items-center text-gray-500 font-medium py-1 px-2 bg-gray-100 rounded text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Reserva finalizada
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={closeBookingModal}
                className="text-xs px-3 py-1"
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden shadow-sm">
            {/* Week Days Header */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
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
                    "bg-background min-h-[120px] p-2 relative transition-colors hover:bg-accent/50 cursor-pointer",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isToday && "bg-primary/10 ring-2 ring-primary ring-offset-1"
                  )}
                  onClick={() => {}}
                >
                  <div
                    className={cn(
                      "text-sm mb-1 flex items-center justify-between",
                      isToday && "font-semibold text-accent-foreground",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    <span>{format(day, "d")}</span>
                    {dayBookings.length > 0 && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => {
                      const statusColors = {
                        PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                        CONFIRMED:
                          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                        COMPLETED: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                        CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
                        NO_SHOW: "bg-muted text-muted-foreground border-border",
                      };

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs p-1.5 rounded-md border truncate cursor-pointer transition-all hover:scale-105 hover:shadow-sm",
                            statusColors[
                              booking.status as keyof typeof statusColors
                            ] || statusColors.PENDING
                          )}
                          title={`${booking.client?.name || "Cliente desconocido"} - ${
                            booking.service?.name || "Servicio desconocido"
                          } - ${format(
                            parseISO(booking.startDateTime),
                            "HH:mm"
                          )}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingModal(booking);
                          }}
                        >
                          <div className="font-medium truncate leading-tight">
                            {format(parseISO(booking.startDateTime), "HH:mm")}
                          </div>
                          <div className="truncate opacity-90 leading-tight">
                            {booking.client?.name || "Cliente"}
                          </div>
                          <div className="truncate opacity-75 text-[10px] leading-tight">
                            {booking.service?.name || "Servicio"}
                          </div>
                        </div>
                      );
                    })}

                    {dayBookings.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium text-center mt-1 py-1 px-2 bg-muted/50 rounded-sm">
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
                          {booking.client?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {booking.client?.name || "Cliente desconocido"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {booking.client?.email || "Email no disponible"}
                              {booking.client?.phone &&
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
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {booking.service?.name ||
                                  "Servicio desconocido"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.professional?.user.name ||
                                  "Sin asignar"}{" "}
                                • {booking.service?.duration || 0}min
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                ${booking.totalPrice.toLocaleString("es-CL")}
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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
}
