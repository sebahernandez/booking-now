"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/useToast";
import { BookingPageWithSlotsLoadingSkeleton } from "@/components/ui/booking-page-loading";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  user: {
    name: string;
    email: string;
  };
  bio?: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  reason?: string;
}

interface ServiceAvailabilitySchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  dayName: string;
}

export default function TenantBookingPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [serviceSchedules, setServiceSchedules] = useState<
    ServiceAvailabilitySchedule[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceId: "",
    professionalId: "",
    date: null as Date | null,
    time: "",
  });

  const fetchServiceSchedules = useCallback(async (serviceId: string) => {
    try {
      const response = await fetch(
        `/api/tenant/services/${serviceId}/availability`
      );
      if (response.ok) {
        const schedules = await response.json();
        setServiceSchedules(schedules);
      } else {
        console.error("Error fetching service schedules:", response.statusText);
        setServiceSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching service schedules:", error);
      setServiceSchedules([]);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    if (!formData.date || !formData.serviceId) return;

    try {
      const params = new URLSearchParams({
        date: format(formData.date, "yyyy-MM-dd"),
        serviceId: formData.serviceId,
      });

      if (formData.professionalId && formData.professionalId !== "any") {
        params.append("professionalId", formData.professionalId);
      }

      const response = await fetch(
        `/api/tenant/services/${formData.serviceId}/availability-slots?${params}`
      );
      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      } else {
        console.error("Error fetching available slots:", response.statusText);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    }
  }, [formData.date, formData.serviceId, formData.professionalId]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/tenant/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        toast.showError("Error al cargar servicios disponibles");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.showError("Error de conexión al cargar servicios");
    }
  }, [toast]);

  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await fetch("/api/tenant/professionals");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      } else {
        toast.showError("Error al cargar profesionales disponibles");
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
      toast.showError("Error de conexión al cargar profesionales");
    }
  }, [toast]);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      await Promise.all([fetchServices(), fetchProfessionals()]);
      setPageLoading(false);
    };
    initializePage();
  }, []);

  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [
    formData.date,
    formData.professionalId,
    formData.serviceId,
    fetchAvailableSlots,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const toastId = toast.showLoading("Creando reserva...");

    try {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (!selectedService || !formData.date) {
        toast.updateToast(toastId, "error", "Faltan datos requeridos para crear la reserva");
        throw new Error("Faltan datos requeridos");
      }

      // Combine date and time using UTC to avoid timezone issues
      const [hours, minutes] = formData.time.split(":");
      const startDateTime = new Date(formData.date);
      // Use setUTCHours to ensure consistent timezone handling
      startDateTime.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setUTCMinutes(
        endDateTime.getUTCMinutes() + selectedService.duration
      );

      const bookingData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        serviceId: formData.serviceId,
        professionalId:
          formData.professionalId === "any" ? null : formData.professionalId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        totalPrice: selectedService.price,
        notes: `Reserva creada desde panel de cliente: ${session?.user?.name}`,
      };

      const response = await fetch("/api/tenant/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.updateToast(toastId, "error", errorData.error || "Error al crear la reserva");
        throw new Error(errorData.error || "Error al crear la reserva");
      }

      toast.updateToast(toastId, "success", "¡Reserva creada exitosamente!");
      setSuccess("¡Reserva creada exitosamente!");

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceId: "",
        professionalId: "",
        date: null,
        time: "",
      });
      setAvailableSlots([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      // El toast ya se actualizó en el catch específico arriba, no necesitamos duplicar aquí
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = useCallback(
    async (serviceId: string) => {
      setFormData({
        ...formData,
        serviceId,
        date: null,
        time: "",
      });
      setAvailableSlots([]);

      if (serviceId) {
        await fetchServiceSchedules(serviceId);
      } else {
        setServiceSchedules([]);
      }
    },
    [formData, fetchServiceSchedules]
  );

  if (pageLoading) {
    return <BookingPageWithSlotsLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Agendar Nueva Cita
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea una nueva reserva para tus clientes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda - Información del Cliente y Servicio */}
        <div className="lg:col-span-2">
          <Card className="h-fit border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Información de la Reserva</CardTitle>
          <CardDescription className="text-muted-foreground">
            Completa todos los campos para crear una nueva cita
          </CardDescription>
        </CardHeader>
        <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Información del Cliente */}
                <div className="space-y-4">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Información del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Nombre del Cliente *</Label>
                        <Input
                          id="clientName"
                          value={formData.clientName}
                          onChange={(e) =>
                            setFormData({ ...formData, clientName: e.target.value })
                          }
                          placeholder="Nombre completo"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email del Cliente *</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, clientEmail: e.target.value })
                          }
                          placeholder="cliente@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="clientPhone">Teléfono del Cliente</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, clientPhone: e.target.value })
                        }
                        placeholder="+56 9 1234 5678"
                        className="max-w-sm"
                      />
                    </div>
                  </div>

                  {/* Selección de Servicio y Profesional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Servicio y Profesional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service">Servicio *</Label>
                        <Select
                          value={formData.serviceId}
                          onValueChange={handleServiceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{service.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ${service.price.toLocaleString("es-CL")} -{" "}
                                    {service.duration} min
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="professional">Profesional</Label>
                        <Select
                          value={formData.professionalId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, professionalId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Cualquier profesional disponible" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">
                              Cualquier profesional disponible
                            </SelectItem>
                            {professionals.map((professional) => (
                              <SelectItem key={professional.id} value={professional.id}>
                                {professional.user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.date ||
                    !formData.time ||
                    !formData.serviceId
                  }
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {loading ? "Creando reserva..." : "Crear Reserva"}
                </Button>
          </form>
        </CardContent>
      </Card>
        </div>

        {/* Columna Derecha - Selección de Fecha y Hora */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Fecha y Hora</CardTitle>
              <CardDescription className="text-muted-foreground">
                Selecciona la fecha y horario para la cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Fecha *</Label>
                {!formData.serviceId ? (
                  <div className="p-6 border-2 border-dashed border-border rounded-lg text-center bg-muted/50">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Selecciona un servicio primero para ver las fechas
                      disponibles
                    </p>
                  </div>
                ) : serviceSchedules.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg text-center bg-orange-50 dark:bg-orange-900/20">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-orange-400 dark:text-orange-500" />
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Este servicio no tiene horarios configurados
                    </p>
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-12"
                        size="lg"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date
                          ? format(formData.date, "PPP", { locale: es })
                          : "Selecciona una fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date ?? undefined}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            date: date ?? null,
                            time: "",
                          })
                        }
                        disabled={(date) => {
                          // Disable past dates
                          if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                            return true;
                          }

                          // Disable dates that don't match service availability
                          const dayOfWeek = date.getDay();
                          const hasScheduleForDay = serviceSchedules.some(
                            (schedule) => schedule.dayOfWeek === dayOfWeek
                          );

                          return !hasScheduleForDay;
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Horarios disponibles */}
              {formData.serviceId && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Horarios Disponibles *</Label>
                  {!formData.date ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        Selecciona una fecha para ver los horarios disponibles
                      </p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={
                              formData.time === slot.time ? "default" : "outline"
                            }
                            size="sm"
                            disabled={!slot.isAvailable}
                            onClick={() =>
                              setFormData({ ...formData, time: slot.time })
                            }
                            className={`text-sm relative h-10 ${
                              !slot.isAvailable
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-accent hover:text-accent-foreground"
                            } ${
                              formData.time === slot.time
                                ? "bg-primary text-primary-foreground border-primary"
                                : ""
                            }`}
                            title={
                              !slot.isAvailable && slot.reason
                                ? slot.reason
                                : `Horario: ${slot.time}`
                            }
                          >
                            {slot.time}
                            {!slot.isAvailable && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                            )}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground pt-2 border-t border-border">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-primary rounded"></div>
                          <span>Disponible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-muted rounded"></div>
                          <span>Ocupado</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No hay horarios disponibles para esta fecha
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
