import { useState, useCallback } from "react";
import { BookingData } from "@/types/booking-wizard";

export function useBookingData() {
  const [bookingData, setBookingData] = useState<BookingData>({});

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetBookingData = useCallback(() => {
    setBookingData({});
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return !!bookingData.service;
        case 2:
          return !!bookingData.dateTime;
        case 3:
          return !!bookingData.professional;
        case 4:
          return !!(
            bookingData.clientName?.trim() &&
            bookingData.clientEmail?.trim()?.includes("@") &&
            bookingData.acceptedTerms
          );
        default:
          return false;
      }
    },
    [bookingData]
  );

  const getValidationError = useCallback(
    (step: number): string => {
      switch (step) {
        case 1:
          return !bookingData.service ? "Por favor selecciona un servicio" : "";
        case 2:
          return !bookingData.dateTime
            ? "Por favor selecciona una fecha y hora"
            : "";
        case 3:
          return !bookingData.professional
            ? "Por favor selecciona un profesional"
            : "";
        case 4:
          if (!bookingData.clientName?.trim()) {
            return "Por favor ingresa tu nombre completo";
          }
          if (!bookingData.clientEmail?.trim()?.includes("@")) {
            return "Por favor ingresa un email válido";
          }
          if (!bookingData.acceptedTerms) {
            return "Debes aceptar los términos y condiciones";
          }
          return "";
        default:
          return "";
      }
    },
    [bookingData]
  );

  return {
    bookingData,
    updateBookingData,
    resetBookingData,
    validateStep,
    getValidationError,
  };
}
