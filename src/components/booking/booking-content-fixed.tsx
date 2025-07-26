"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/providers/booking-provider";
import { ServiceSelectionStep } from "./steps/service-selection-step";
import { DateTimeStep } from "./steps/datetime-step";
import { InformationStep } from "./steps/information-step";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { format, addMinutes, parse } from "date-fns";
import { es } from "date-fns/locale";

interface TenantService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface TenantProfessional {
  id: string;
  user: {
    name: string;
    email: string;
  };
  bio?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface BookingContentProps {
  tenantServices?: TenantService[];
  tenantProfessionals?: TenantProfessional[];
  tenantInfo?: TenantInfo;
}

export function BookingContent({
  tenantServices = [],
  tenantProfessionals = [],
}: BookingContentProps) {
  const {
    currentStep,
    nextStep,
    previousStep,
    canProceed,
    formData,
    tenantId,
    isWidget,
    isClient,
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Protección contra problemas de hidratación - solo ejecutar en cliente
  useEffect(() => {
    // Asegurar que todas las operaciones dinámicas se ejecuten solo del lado del cliente
    // con un delay para evitar problemas de hidratación
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Helper para formateo de fecha consistente entre servidor y cliente
  const formatDateSafely = (date: Date, formatString: string) => {
    if (!isMounted || !isClient) return "";
    try {
      return format(date, formatString, { locale: es });
    } catch {
      return "";
    }
  };

  // Helper para formateo de tiempo consistente entre servidor y cliente
  const formatTimeSafely = (time: string, duration: number) => {
    if (!isMounted || !isClient) return "";

    try {
      // Create a fixed date to avoid server/client differences
      const baseDate = new Date("2024-01-01T00:00:00.000Z");
      const endTime = addMinutes(parse(time, "HH:mm", baseDate), duration);
      // Usar formato fijo sin depender de locale del sistema
      const hours = endTime.getHours().toString().padStart(2, "0");
      const minutes = endTime.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // Find the selected service and professional from formData
  const selectedService = formData.serviceId
    ? tenantServices.find((s) => s.id === formData.serviceId)
    : undefined;

  const selectedProfessional = formData.professionalId
    ? tenantProfessionals.find((p) => p.id === formData.professionalId)
    : undefined;

  // Early return para evitar renderizado hasta que el componente esté completamente hidratado
  if (!isMounted || !isClient) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando sistema de reservas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitBooking = async () => {
    if (!formData.date || !formData.time) return;

    setIsSubmitting(true);
    try {
      // Usar API específica para widgets si estamos en modo widget
      const apiUrl =
        isWidget && tenantId
          ? `/api/widget/tenant/${tenantId}/bookings`
          : "/api/bookings";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          professionalId: formData.professionalId,
          date: formData.date.toISOString(),
          time: formData.time,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error al enviar la reserva. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (isSubmitted) {
      return (
        <Card className="p-12 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Su cita ha sido reservada exitosamente. Recibirá un email de
            confirmación en breve.
          </p>
          <div className="text-sm text-gray-500 bg-white rounded-lg p-4 inline-block">
            <p>
              <strong>¿Qué sigue?</strong>
            </p>
            <p>• Recibirá un email de confirmación</p>
            <p>• Le enviaremos un recordatorio 24 horas antes</p>
            <p>• Puede modificar o cancelar su cita contactándonos</p>
          </div>
        </Card>
      );
    }

    switch (currentStep) {
      case "service":
        return <ServiceSelectionStep tenantServices={tenantServices} />;
      case "datetime":
        return <DateTimeStep />;
      case "information":
        return <InformationStep />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === "information";
  const isFirstStep = currentStep === "service";

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">{renderStep()}</div>
      </div>

      {!isSubmitted && (
        <div className="border-t bg-white shadow-lg">
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isFirstStep || isSubmitting}
                className="flex items-center space-x-2 px-6 py-3"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 hidden sm:block">
                  {currentStep === "service" && "Paso 1 de 3"}
                  {currentStep === "datetime" && "Paso 2 de 3"}
                  {currentStep === "information" && "Paso 3 de 3"}
                </div>

                <Button
                  onClick={isLastStep ? handleSubmitBooking : nextStep}
                  disabled={!canProceed || isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3"
                  size="lg"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {isSubmitting
                      ? "Procesando..."
                      : isLastStep
                      ? "Confirmar Reserva"
                      : "Continuar"}
                  </span>
                  {!isLastStep && !isSubmitting && (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Resumen solo si tenemos datos y está montado del lado del cliente */}
            {isMounted && isClient && selectedService && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen de tu reserva
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedService.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duración: {selectedService.duration} minutos
                        </p>
                        <p className="text-sm font-medium text-blue-700">
                          ${selectedService.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedProfessional && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedProfessional.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedProfessional.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {formatDateSafely(
                              formData.date,
                              "EEEE, d MMMM yyyy"
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formData.time} -{" "}
                            {formatTimeSafely(
                              formData.time,
                              selectedService?.duration || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-lg font-bold mt-6 pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-rose-600">
                    ${selectedService?.price || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
