"use client";

import React, { useEffect, useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Loader2, Calendar } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface TenantService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface Professional {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ServiceSelectionStepProps {
  tenantServices?: TenantService[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

interface ServiceSelectionStepProps {
  tenantServices?: TenantService[];
}

export function ServiceSelectionStep({
  tenantServices,
}: ServiceSelectionStepProps) {
  const { formData, updateFormData, tenantId } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [serviceAvailability, setServiceAvailability] = useState<
    ServiceAvailability[]
  >([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    if (tenantServices) {
      // Si tenemos servicios del tenant, usarlos directamente
      const formattedServices = tenantServices.map((service) => ({
        ...service,
        description: service.description || null,
      }));
      setServices(formattedServices);
      setIsLoadingServices(false);
    } else {
      // Si no, cargar desde la API (modo admin)
      fetchServices();
    }
  }, [tenantServices]);

  useEffect(() => {
    if (formData.serviceId) {
      fetchProfessionals(formData.serviceId);
      fetchServiceAvailability(formData.serviceId);
    } else {
      setProfessionals([]);
      setServiceAvailability([]);
    }
  }, [formData.serviceId]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (Array.isArray(data)) {
        setServices(data);
      } else {
        console.error("Services data is not an array:", data);
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchProfessionals = async (serviceId: string) => {
    setIsLoadingProfessionals(true);
    try {
      const response = await fetch(`/api/professionals?serviceId=${serviceId}`);
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  const fetchServiceAvailability = async (serviceId: string) => {
    setIsLoadingAvailability(true);
    try {
      // Usar la API del tenant si estamos en modo widget
      const apiUrl = tenantId
        ? `/api/widget/tenant/${tenantId}/services/${serviceId}/availability`
        : `/api/tenant/services/${serviceId}/availability`;

      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setServiceAvailability(data);
      } else {
        setServiceAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching service availability:", error);
      setServiceAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    updateFormData({ selectedTimeSlot: timeSlot });
  };

  console.log(
    "Services:",
    services,
    "FormData.serviceId:",
    formData?.serviceId
  );
  const selectedService =
    Array.isArray(services) && formData?.serviceId
      ? services.find((s) => s.id === formData.serviceId)
      : null;

  // Agrupar horarios por día de la semana
  const groupedAvailability = serviceAvailability.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, ServiceAvailability[]>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Seleccionar Servicio
        </h2>
        <p className="text-xl text-gray-600">
          Elija el servicio que desea reservar y seleccione un horario
          disponible.
        </p>
      </div>

      <div className="grid gap-8">
        <div className="space-y-4">
          <Label
            htmlFor="service"
            className="text-lg font-semibold text-gray-800"
          >
            Servicio *
          </Label>
          <Select
            value={formData.serviceId || ""}
            onValueChange={(value) =>
              updateFormData({
                serviceId: value,
                professionalId: "",
                selectedTimeSlot: "",
              })
            }
            disabled={isLoadingServices}
          >
            <SelectTrigger className="mt-2">
              <SelectValue
                placeholder={
                  isLoadingServices
                    ? "Cargando servicios..."
                    : "Seleccionar un servicio"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingServices ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.name}</span>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <Clock className="h-3 w-3" />
                          <span>{service.duration}m</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <DollarSign className="h-3 w-3" />
                          <span>${service.price}</span>
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedService && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedService.name}
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{selectedService.duration} minutos</span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <DollarSign className="h-3 w-3" />
                    <span>${selectedService.price}</span>
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>{selectedService.description}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Horarios Disponibles */}
        {formData.serviceId && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-semibold text-gray-800">
                Horarios Disponibles *
              </Label>
            </div>

            {isLoadingAvailability ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando horarios disponibles...</span>
              </div>
            ) : serviceAvailability.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No hay horarios configurados
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Este servicio está disponible 24/7. Podrá seleccionar
                    cualquier fecha y hora en el siguiente paso.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedules = groupedAvailability[day.value] || [];
                  if (daySchedules.length === 0) return null;

                  return (
                    <Card key={day.value} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          {day.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {daySchedules
                            .sort((a, b) =>
                              a.startTime.localeCompare(b.startTime)
                            )
                            .map((schedule) => {
                              const timeSlotKey = `${day.value}-${schedule.startTime}-${schedule.endTime}`;
                              const isSelected =
                                formData.selectedTimeSlot === timeSlotKey;

                              return (
                                <Button
                                  key={schedule.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`w-full justify-start text-sm ${
                                    isSelected
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "hover:bg-blue-50"
                                  }`}
                                  onClick={() =>
                                    handleTimeSlotSelect(timeSlotKey)
                                  }
                                >
                                  <Clock className="h-3 w-3 mr-2" />
                                  {schedule.startTime} - {schedule.endTime}
                                </Button>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {formData.serviceId && (
          <div>
            <Label htmlFor="professional" className="text-base font-medium">
              Selecciona un profesional
            </Label>
            <Select
              value={formData.professionalId || ""}
              onValueChange={(value) =>
                updateFormData({ professionalId: value })
              }
              disabled={isLoadingProfessionals}
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    isLoadingProfessionals
                      ? "Cargando profesionales..."
                      : "Profesional disponible"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProfessionals ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <SelectItem value="any">
                      Cualquier profesional disponible
                    </SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.user.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
