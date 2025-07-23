"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Clock, User, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export default function TenantBookingPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceId: "",
    professionalId: "",
    date: null as Date | null,
    time: "",
  });

  useEffect(() => {
    fetchServices();
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.professionalId, formData.serviceId]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/tenant/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/tenant/professionals");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!formData.date || !formData.serviceId) return;

    try {
      const params = new URLSearchParams({
        date: format(formData.date, "yyyy-MM-dd"),
        serviceId: formData.serviceId,
      });

      if (formData.professionalId && formData.professionalId !== "any") {
        params.append("professionalId", formData.professionalId);
      }

      const response = await fetch(`/api/professionals/available-times?${params}`);
      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      if (!selectedService || !formData.date) {
        throw new Error("Faltan datos requeridos");
      }

      // Combine date and time
      const [hours, minutes] = formData.time.split(':');
      const startDateTime = new Date(formData.date);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration);

      const bookingData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        serviceId: formData.serviceId,
        professionalId: formData.professionalId === "any" ? null : formData.professionalId,
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
        throw new Error(errorData.error || "Error al crear la reserva");
      }

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
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agendar Nueva Cita</h1>
        <p className="text-gray-600">
          Crea una nueva reserva para tus clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Reserva</CardTitle>
          <CardDescription>
            Completa todos los campos para crear una nueva cita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Cliente Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Teléfono del Cliente</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>

            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="service">Servicio *</Label>
              <Select 
                value={formData.serviceId} 
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ${service.price.toLocaleString('es-CL')} - {service.duration} min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profesional */}
            <div className="space-y-2">
              <Label htmlFor="professional">Profesional</Label>
              <Select 
                value={formData.professionalId} 
                onValueChange={(value) => setFormData({ ...formData, professionalId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier profesional disponible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquier profesional disponible</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: es }) : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horarios disponibles */}
            {availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Horario Disponible *</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={formData.time === slot.time ? "default" : "outline"}
                      size="sm"
                      disabled={!slot.isAvailable}
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                      className="text-xs"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !formData.date || !formData.time || !formData.serviceId}
              className="w-full"
            >
              {loading ? "Creando reserva..." : "Crear Reserva"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}