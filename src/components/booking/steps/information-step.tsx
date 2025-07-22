"use client";

import React, { useEffect, useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Settings,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

const professionals = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Mike Wilson" },
];

export function InformationStep() {
  const { formData, updateFormData } = useBooking();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

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
    }
  };

  console.log("Services:", services, "FormData.serviceId:", formData.serviceId);
  const selectedService = formData.serviceId
    ? services.find((s) => s.id === formData.serviceId)
    : null;
  const selectedProfessional = professionals.find(
    (p) => p.id === formData.professionalId
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Su Información
        </h2>
        <p className="text-xl text-gray-600">
          Por favor, proporcione su información de contacto para completar la
          reserva.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl text-blue-900">
            <Settings className="h-6 w-6" />
            <span>Resumen de la Reserva</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedService && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedService.name}
                  </p>
                  <p className="text-gray-600">Servicio seleccionado</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1 bg-blue-100 text-blue-800"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{selectedService.duration}m</span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 text-lg px-3 py-1"
                  >
                    ${selectedService.price}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {selectedProfessional && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedProfessional.name}
                  </p>
                  <p className="text-gray-600">Profesional asignado</p>
                </div>
              </div>
            </div>
          )}

          {formData.date && formData.time && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {format(formData.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </p>
                  <p className="text-gray-600">
                    {formData.time} - Fecha y hora
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información de contacto</span>
          </CardTitle>
          <CardDescription>
            Usaremos esta información para confirmar tu cita y enviar
            actualizaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="customerName"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Nombre completo *</span>
              </Label>
              <Input
                id="customerName"
                placeholder="Ingresa tu nombre completo"
                value={formData.customerName || ""}
                onChange={(e) =>
                  updateFormData({ customerName: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="customerEmail"
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Correo Electrónico *</span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={formData.customerEmail || ""}
                onChange={(e) =>
                  updateFormData({ customerEmail: e.target.value })
                }
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="customerPhone"
              className="flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Número de teléfono *</span>
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="Ingresa tu número de teléfono"
              value={formData.customerPhone || ""}
              onChange={(e) =>
                updateFormData({ customerPhone: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Notas adicionales (Opcional)</span>
            </Label>
            <textarea
              id="notes"
              placeholder="Cualquier solicitud o nota especial para tu cita..."
              value={formData.notes || ""}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              className="mt-2 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-green-900">
                ¿Qué sucede después?
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Después de completar tu reserva, recibirás un correo electrónico
                de confirmación con los detalles de tu cita. También te
                enviaremos un recordatorio 24 horas antes de tu cita.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
