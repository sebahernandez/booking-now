"use client";

import React, { useEffect, useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Clock, DollarSign, Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function ServiceSelectionStep() {
  const { formData, updateFormData } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.serviceId) {
      fetchProfessionals(formData.serviceId);
    } else {
      setProfessionals([]);
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Seleccionar Servicio
        </h2>
        <p className="text-xl text-gray-600">
          Elija el servicio que desea reservar y opcionalmente seleccione un
          profesional de su preferencia.
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
              updateFormData({ serviceId: value, professionalId: "" })
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

        {formData.serviceId && (
          <div>
            <Label htmlFor="professional" className="text-base font-medium">
              Seleciona un profesional
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
                      ? "Loading professionals..."
                      : "Any available professional"
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
