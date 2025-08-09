"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  User,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  clientName: string;
  clientEmail?: string;
  serviceName: string;
  professionalName: string;
  startDateTime: string;
  endDateTime?: string;
  status: string;
  totalPrice?: number;
  notes?: string;
}

interface BookingsTableProps {
  showTitle?: boolean;
  maxHeight?: string;
}

export default function RecentBookingsTable({
  showTitle = true,
  maxHeight = "600px",
}: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PENDING", label: "Pendiente" },
    { value: "CONFIRMED", label: "Confirmada" },
    { value: "COMPLETED", label: "Completada" },
    { value: "CANCELLED", label: "Cancelada" },
  ];

  const dateOptions = [
    { value: "ALL", label: "Todas las fechas" },
    { value: "TODAY", label: "Hoy" },
    { value: "WEEK", label: "Esta semana" },
    { value: "MONTH", label: "Este mes" },
    { value: "PAST", label: "Pasadas" },
    { value: "FUTURE", label: "Futuras" },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tenant/bookings?limit=100");
      if (response.ok) {
        const data = await response.json();
        // Asegurar que siempre sea un array
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } else {
        console.error("Error response:", response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    // Asegurar que bookings sea siempre un array
    if (!Array.isArray(bookings)) {
      return [];
    }

    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.clientName.toLowerCase().includes(search) ||
          booking.serviceName.toLowerCase().includes(search) ||
          booking.professionalName.toLowerCase().includes(search) ||
          booking.clientEmail?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(
        today.getTime() - today.getDay() * 24 * 60 * 60 * 1000
      );
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.startDateTime);

        switch (dateFilter) {
          case "TODAY":
            return (
              bookingDate >= today &&
              bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          case "WEEK":
            return bookingDate >= weekStart && bookingDate <= now;
          case "MONTH":
            return bookingDate >= monthStart && bookingDate <= now;
          case "PAST":
            return bookingDate < now;
          case "FUTURE":
            return bookingDate > now;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const paginatedBookings = useMemo(() => {
    if (!Array.isArray(filteredBookings)) {
      return [];
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil((Array.isArray(filteredBookings) ? filteredBookings.length : 0) / pageSize);

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const exportData = () => {
    const csvContent = [
      [
        "Cliente",
        "Email",
        "Servicio",
        "Profesional",
        "Fecha",
        "Estado",
        "Precio",
      ],
      ...filteredBookings.map((booking) => [
        booking.clientName,
        booking.clientEmail || "",
        booking.serviceName,
        booking.professionalName,
        formatDateTime(booking.startDateTime),
        booking.status,
        booking.totalPrice ? `$${booking.totalPrice}` : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 shadow-sm">
      {showTitle && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-xl font-semibold text-gray-900">
                Reservas Recientes
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                disabled={filteredBookings.length === 0}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, servicio o profesional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900">
              {filteredBookings.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-700">
              {Array.isArray(filteredBookings)
                ? filteredBookings.filter((b) => b.status === "CONFIRMED")
                    .length
                : 0}
            </div>
            <div className="text-xs text-green-600">Confirmadas</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-semibold text-amber-700">
              {Array.isArray(filteredBookings)
                ? filteredBookings.filter((b) => b.status === "PENDING").length
                : 0}
            </div>
            <div className="text-xs text-amber-600">Pendientes</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-semibold text-blue-700">
              {Array.isArray(filteredBookings)
                ? filteredBookings.filter((b) => b.status === "COMPLETED")
                    .length
                : 0}
            </div>
            <div className="text-xs text-blue-600">Completadas</div>
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-auto" style={{ maxHeight }}>
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Servicio</TableHead>
                  <TableHead className="font-semibold">Profesional</TableHead>
                  <TableHead className="font-semibold">Fecha y Hora</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">
                    Precio
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ||
                          statusFilter !== "ALL" ||
                          dateFilter !== "ALL"
                            ? "No se encontraron reservas"
                            : "No hay reservas aún"}
                        </h3>
                        <p className="text-gray-500 text-center max-w-sm">
                          {searchTerm ||
                          statusFilter !== "ALL" ||
                          dateFilter !== "ALL"
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "Cuando tengas reservas, aparecerán aquí"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((booking) => {
                    const statusBadge = getStatusBadge(booking.status);
                    return (
                      <TableRow key={booking.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {booking.clientName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.clientName}
                              </p>
                              {booking.clientEmail && (
                                <p className="text-sm text-gray-500">
                                  {booking.clientEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.serviceName}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {booking.professionalName}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDateTime(booking.startDateTime)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs font-medium border",
                              statusBadge.className
                            )}
                          >
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.totalPrice ? (
                            <span className="font-medium">
                              ${booking.totalPrice.toLocaleString("es-CL")}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openBookingModal(booking)}
                            title="Ver detalles de la reserva"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, filteredBookings.length)} de{" "}
              {filteredBookings.length} resultados
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de Detalles de Reserva */}
      {selectedBooking && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de la Reserva
              </DialogTitle>
              <DialogDescription>
                Información completa de la reserva #{selectedBooking.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Estado de la Reserva */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Estado</h3>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(selectedBooking.startDateTime)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-sm font-medium border",
                    getStatusBadge(selectedBooking.status).className
                  )}
                >
                  {getStatusBadge(selectedBooking.status).label}
                </Badge>
              </div>

              {/* Información del Cliente */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {selectedBooking.clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.clientName}
                      </p>
                      {selectedBooking.clientEmail && (
                        <p className="text-sm text-gray-600">
                          {selectedBooking.clientEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Servicio */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Servicio
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {selectedBooking.serviceName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Profesional: {selectedBooking.professionalName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {formatDateTime(selectedBooking.startDateTime)}
                      </span>
                    </div>
                    {selectedBooking.endDateTime && (
                      <div className="text-gray-500">
                        hasta {new Date(selectedBooking.endDateTime).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Precio */}
              {selectedBooking.totalPrice && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Precio
                  </h3>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Total a pagar</span>
                      <span className="text-2xl font-bold text-emerald-700">
                        ${selectedBooking.totalPrice.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-600 mt-2">
                      {selectedBooking.status === "COMPLETED"
                        ? "✓ Servicio completado"
                        : selectedBooking.status === "CONFIRMED"
                        ? "⏳ Confirmado - Pendiente de completar"
                        : "📋 En proceso"}
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedBooking.notes && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={closeBookingModal}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
