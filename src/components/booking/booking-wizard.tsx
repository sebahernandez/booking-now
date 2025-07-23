"use client";

import React from "react";
import { BookingProvider } from "@/providers/booking-provider";
import { BookingSidebar } from "./booking-sidebar";
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
  return (
    <BookingProvider tenantId={tenantId} isWidget={isWidget}>
      <div className={isWidget ? "flex" : "min-h-screen bg-gray-50 flex"}>
        <BookingSidebar />
        <BookingContent
          tenantServices={tenantServices}
          tenantProfessionals={tenantProfessionals}
          tenantInfo={tenantInfo}
        />
      </div>
    </BookingProvider>
  );
}
