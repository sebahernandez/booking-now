"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/providers/booking-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, DollarSign, User } from "lucide-react";

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

interface ServiceSelectionStepProps {
  tenantServices?: TenantService[];
  tenantProfessionals?: TenantProfessional[];
}

// Client-side only wrapper
function ClientOnlyWrapper({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

function ServiceSelectionContent({
  tenantServices = [],
  tenantProfessionals = [],
}: ServiceSelectionStepProps) {
  const { formData, updateFormData } = useBooking();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    if (!isMounted) return;

    updateFormData({ serviceId });

    // Auto-select first professional if available
    if (tenantProfessionals.length > 0 && !formData.professionalId) {
      updateFormData({ professionalId: tenantProfessionals[0].id });
    }
  };

  const handleProfessionalSelect = (professionalId: string) => {
    if (!isMounted) return;

    updateFormData({ professionalId });
  };

  // Safe formatting functions
  const formatPrice = (price: number) => {
    if (!isMounted) return "";
    try {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    } catch {
      return `€${price}`;
    }
  };

  const formatDuration = (duration: number) => {
    if (!isMounted) return "";

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Paso 1 de 3</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Selecciona un servicio
        </h2>
        <p className="text-gray-600">
          Elige el servicio que necesitas y el profesional de tu preferencia
        </p>
      </div>

      {/* Services */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Servicios disponibles
        </h3>

        {tenantServices.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay servicios disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantServices.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.serviceId === service.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{service.name}</span>
                    {formData.serviceId === service.id && (
                      <Badge variant="default" className="bg-blue-600">
                        Seleccionado
                      </Badge>
                    )}
                  </CardTitle>
                  {service.description && (
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(service.price)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Professionals */}
      {formData.serviceId && tenantProfessionals.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Selecciona un profesional
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantProfessionals.map((professional) => (
              <Card
                key={professional.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.professionalId === professional.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleProfessionalSelect(professional.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-lg">{professional.user.name}</span>
                    </div>
                    {formData.professionalId === professional.id && (
                      <Badge variant="default" className="bg-blue-600">
                        Seleccionado
                      </Badge>
                    )}
                  </CardTitle>
                  {professional.bio && (
                    <p className="text-sm text-gray-600 ml-13">
                      {professional.bio}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {professional.user.email}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {formData.serviceId && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Servicio seleccionado
                </p>
                <p className="text-lg font-semibold text-green-900">
                  {
                    tenantServices.find((s) => s.id === formData.serviceId)
                      ?.name
                  }
                </p>
                {formData.professionalId && (
                  <p className="text-sm text-green-700 mt-1">
                    con{" "}
                    {
                      tenantProfessionals.find(
                        (p) => p.id === formData.professionalId
                      )?.user.name
                    }
                  </p>
                )}
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓ Confirmado
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ServiceSelectionStep({
  tenantServices,
  tenantProfessionals,
}: ServiceSelectionStepProps) {
  return (
    <ClientOnlyWrapper
      fallback={
        <div className="space-y-8">
          <div className="text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">
              Cargando selección de servicios...
            </p>
          </div>
        </div>
      }
    >
      <ServiceSelectionContent
        tenantServices={tenantServices}
        tenantProfessionals={tenantProfessionals}
      />
    </ClientOnlyWrapper>
  );
}
