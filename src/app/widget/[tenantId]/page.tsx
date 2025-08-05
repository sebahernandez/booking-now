"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { useEffect, useState } from "react";
import { WidgetLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface TenantData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
  }>;
  professionals: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    bio?: string;
  }>;
}

export default function BookingWidget() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await fetch(`/api/widget/tenant/${tenantId}`);
        if (!response.ok) {
          throw new Error("Tenant no encontrado");
        }
        const data = await response.json();
        setTenantData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
    }
  }, [tenantId]);

  if (loading) {
    return <WidgetLoadingSkeleton />;
  }

  if (error || !tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Widget no disponible
          </h2>
          <p className="text-red-600">
            {error || "No se pudo cargar el widget de reservas"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Solo el Widget de Reservas */}
      <BookingWizard
        tenantId={tenantId}
        isWidget={true}
        tenantServices={tenantData.services}
        tenantProfessionals={tenantData.professionals}
        tenantInfo={{
          id: tenantData.id,
          name: tenantData.name,
          email: tenantData.email,
          phone: tenantData.phone,
        }}
      />
    </div>
  );
}
