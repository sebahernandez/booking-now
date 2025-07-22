"use client";

import React from "react";
import { useBooking } from "@/providers/booking-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const stepConfig = [
  {
    id: "service",
    title: "Selección de Servicio",
    description: "Elige el servicio que deseas reservar",
    icon: Settings,
  },
  {
    id: "datetime",
    title: "Fecha y Hora",
    description: "Selecciona cuándo quieres tu cita",
    icon: Calendar,
  },
  {
    id: "information",
    title: "Tu Información",
    description: "Completa tus datos de contacto",
    icon: User,
  },
];

export function BookingSidebar() {
  const { currentStep, formData, setCurrentStep } = useBooking();

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case "service":
        return !!formData.serviceId;
      case "datetime":
        return !!(formData.date && formData.time);
      case "information":
        return !!(formData.customerName && formData.customerEmail);
      default:
        return false;
    }
  };

  const isStepAccessible = (stepId: string) => {
    const stepIndex = stepConfig.findIndex((step) => step.id === stepId);
    const currentIndex = stepConfig.findIndex(
      (step) => step.id === currentStep
    );

    // Allow access to current step and previous completed steps
    if (stepIndex <= currentIndex) return true;

    // Allow access to next step if current step is completed
    if (stepIndex === currentIndex + 1 && isStepCompleted(currentStep))
      return true;

    return false;
  };

  return (
    <div className="w-96 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Reservar Cita</h1>
          <p className="text-slate-300 text-lg">
            Complete los pasos para programar su cita
          </p>
        </div>

        <div className="space-y-6">
          {stepConfig.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);

            return (
              <div
                key={step.id}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group",
                  isActive &&
                    "bg-blue-600 shadow-xl shadow-blue-600/25 scale-105",
                  !isActive &&
                    isAccessible &&
                    "hover:bg-slate-700 hover:scale-102",
                  !isAccessible && "opacity-50 cursor-not-allowed"
                )}
                onClick={() =>
                  isAccessible &&
                  setCurrentStep(
                    step.id as "service" | "datetime" | "information"
                  )
                }
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          isActive
                            ? "bg-white/20"
                            : "bg-slate-700 group-hover:bg-slate-600"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isActive ? "text-white" : "text-slate-300"
                          )}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={cn(
                          "font-semibold text-lg",
                          isActive ? "text-white" : "text-slate-200"
                        )}
                      >
                        {step.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium px-2 py-1",
                          isCompleted
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : isActive
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-slate-700 text-slate-300 border-slate-600"
                        )}
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        isActive ? "text-blue-100" : "text-slate-400"
                      )}
                    >
                      {step.description}
                    </p>

                    {isCompleted && (
                      <div className="mt-2">
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                          ✓ Completado
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/50 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-4 bg-slate-800 rounded-xl">
          <h4 className="font-semibold text-slate-200 mb-2">
            ¿Necesita ayuda?
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Si tiene preguntas sobre nuestros servicios, no dude en
            contactarnos.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="w-full border-black text-black hover:bg-white"
          >
            Contactar Soporte
          </Button>
        </div>
      </div>
    </div>
  );
}
