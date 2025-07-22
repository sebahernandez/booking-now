"use client";

import React, { useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import { ServiceSelectionStep } from "./steps/service-selection-step";
import { DateTimeStep } from "./steps/datetime-step";
import { InformationStep } from "./steps/information-step";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function BookingContent() {
  const { currentStep, nextStep, previousStep, canProceed, formData } =
    useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitBooking = async () => {
    if (!formData.date || !formData.time) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
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
        return <ServiceSelectionStep />;
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
          </div>
        </div>
      )}
    </div>
  );
}
