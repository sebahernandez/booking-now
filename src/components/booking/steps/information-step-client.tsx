"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/providers/booking-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MessageSquare } from "lucide-react";

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

function InformationStepContent() {
  const { formData, updateFormData } = useBooking();
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (!isMounted) return;

    updateFormData({ [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field: string, value: string) => {
    if (!isMounted) return "";

    switch (field) {
      case "customerName":
        return value.trim().length < 2
          ? "El nombre debe tener al menos 2 caracteres"
          : "";

      case "customerEmail":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          return "El email es requerido";
        }
        if (!emailRegex.test(value)) {
          return "Ingresa un email válido";
        }
        return "";

      case "customerPhone":
        const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
        if (value.trim() && !phoneRegex.test(value)) {
          return "Ingresa un número de teléfono válido";
        }
        return "";

      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    if (!isMounted) return;

    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    if (!isMounted) return false;

    const newErrors: Record<string, string> = {};

    newErrors.customerName = validateField(
      "customerName",
      formData.customerName || ""
    );
    newErrors.customerEmail = validateField(
      "customerEmail",
      formData.customerEmail || ""
    );
    newErrors.customerPhone = validateField(
      "customerPhone",
      formData.customerPhone || ""
    );

    // Filter out empty errors
    const filteredErrors = Object.entries(newErrors)
      .filter(([, error]) => error !== "")
      .reduce((acc, [key, error]) => ({ ...acc, [key]: error }), {});

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
          <User className="h-5 w-5" />
          <span className="text-sm font-medium">Paso 3 de 3</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Información de contacto
        </h2>
        <p className="text-gray-600">
          Completa tus datos para confirmar la reserva
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos personales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Nombre completo *
            </Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Ingresa tu nombre completo"
              value={formData.customerName || ""}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
              onBlur={(e) => handleBlur("customerName", e.target.value)}
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && (
              <p className="text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="customerEmail"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="tu@email.com"
              value={formData.customerEmail || ""}
              onChange={(e) =>
                handleInputChange("customerEmail", e.target.value)
              }
              onBlur={(e) => handleBlur("customerEmail", e.target.value)}
              className={errors.customerEmail ? "border-red-500" : ""}
            />
            {errors.customerEmail && (
              <p className="text-sm text-red-600">{errors.customerEmail}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="customerPhone"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Teléfono (opcional)
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="+34 600 000 000"
              value={formData.customerPhone || ""}
              onChange={(e) =>
                handleInputChange("customerPhone", e.target.value)
              }
              onBlur={(e) => handleBlur("customerPhone", e.target.value)}
              className={errors.customerPhone ? "border-red-500" : ""}
            />
            {errors.customerPhone && (
              <p className="text-sm text-red-600">{errors.customerPhone}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Notas adicionales (opcional)
            </Label>
            <textarea
              id="notes"
              placeholder="¿Algo más que deberíamos saber?"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Validation Button */}
          <Button
            onClick={validateForm}
            variant="outline"
            className="w-full"
            type="button"
          >
            Validar información
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      {formData.customerName && formData.customerEmail && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              Información de contacto confirmada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{formData.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>{formData.customerEmail}</span>
              </div>
              {formData.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{formData.customerPhone}</span>
                </div>
              )}
              {formData.notes && (
                <div className="flex items-start gap-3 pt-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">{formData.notes}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-blue-200">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ✓ Información completa
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function InformationStep() {
  return (
    <ClientOnlyWrapper
      fallback={
        <div className="space-y-8">
          <div className="text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">
              Cargando información...
            </p>
          </div>
        </div>
      }
    >
      <InformationStepContent />
    </ClientOnlyWrapper>
  );
}
