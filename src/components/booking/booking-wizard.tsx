"use client";

import React, { useEffect, useState } from "react";
import { BookingProvider } from "@/providers/booking-provider";
import { BookingContent } from "./booking-content";

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

interface BookingWizardProps {
  tenantServices?: TenantService[];
  tenantProfessionals?: TenantProfessional[];
  tenantInfo?: TenantInfo;
  tenantId?: string;
  isWidget?: boolean;
}

export function BookingWizard({
  tenantServices,
  tenantProfessionals,
  tenantInfo,
  tenantId,
  isWidget = false,
}: BookingWizardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [clientState, setClientState] = useState({
    timestamp: null as number | null,
    sessionId: null as string | null,
    isClient: false,
  });

  useEffect(() => {
    // Garantizar que el widget funcione correctamente en iframe
    // y evitar problemas de hidratación

    // Solo ejecutar después de la hidratación completa del cliente
    const initializeClientState = () => {
      setIsMounted(true);
      setClientState({
        timestamp: Date.now(),
        sessionId: `booking-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        isClient: true,
      });
    };

    // Para widgets en iframe, añadir delay para asegurar hidratación completa
    if (isWidget) {
      const timer = setTimeout(initializeClientState, 150);
      return () => clearTimeout(timer);
    } else {
      // Para apps normales, inicializar inmediatamente después de mount
      initializeClientState();
    }
  }, [isWidget]);

  // Para widgets, mostrar loading hasta que esté completamente montado del lado del cliente
  if (isWidget && (!isMounted || !clientState.isClient)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Iniciando sistema de reservas...
          </p>
        </div>
      </div>
    );
  }

  // Para aplicaciones normales, usar el loading estándar
  if (!isWidget && !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <BookingProvider tenantId={tenantId} isWidget={isWidget}>
      <div
        className={isWidget ? "flex" : "min-h-screen bg-gray-50 flex"}
        data-widget={isWidget ? "true" : "false"}
        data-session-id={clientState.sessionId || ""}
        suppressHydrationWarning={true}
      >
        <BookingContent
          tenantServices={tenantServices}
          tenantProfessionals={tenantProfessionals}
          tenantInfo={tenantInfo}
        />
      </div>
    </BookingProvider>
  );
}
