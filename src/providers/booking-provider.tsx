"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { BookingFormData, BookingStep } from "@/types/booking";

interface BookingContextType {
  currentStep: BookingStep;
  formData: Partial<BookingFormData>;
  tenantId?: string;
  isWidget?: boolean;
  isClient: boolean;
  setCurrentStep: (step: BookingStep) => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const steps: BookingStep[] = ["service", "datetime", "information"];

export function BookingProvider({
  children,
  tenantId,
  isWidget = false,
}: {
  children: ReactNode;
  tenantId?: string;
  isWidget?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Asegurar que el provider esté completamente inicializado del lado del cliente
    // especialmente importante para widgets en iframe
    setIsClient(true);

    // Para widgets, añadir metadata adicional para debugging solo del lado del cliente
    if (isWidget) {
      // Usar setTimeout para asegurar que window esté disponible después de hidratación
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          interface DebugInfo {
            tenantId?: string;
            initialized: number;
            userAgent: string;
            isIframe: boolean;
          }

          // Use current timestamp for debug info only on client
          const timestamp = Date.now();
          
          (
            window as unknown as Record<string, unknown>
          ).__BOOKING_WIDGET_DEBUG = {
            tenantId,
            initialized: timestamp,
            userAgent: navigator.userAgent,
            isIframe: window !== window.top,
          } as DebugInfo;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isWidget, tenantId]);

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        // Para servicios sin horarios configurados, solo necesitamos el serviceId
        // Para servicios con horarios, necesitamos serviceId y selectedTimeSlot
        return !!formData.serviceId;
      case "datetime":
        return !!(formData.date && formData.time);
      case "information":
        return !!(formData.customerName && formData.customerEmail);
      default:
        return false;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        formData,
        tenantId,
        isWidget,
        isClient,
        setCurrentStep,
        updateFormData,
        nextStep,
        previousStep,
        canProceed: canProceed(),
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
