import { useState, useEffect, useCallback, useMemo } from "react";
import { useBookingData } from "./useBookingData";
import { useWizardNavigation } from "./useWizardNavigation";
import { useServiceAvailability } from "./useServiceAvailability";
import { useCalendar } from "./useCalendar";
import { BookingApiService } from "@/services/booking-api";
import { Service, Professional, AvailableSlot } from "@/types/booking-wizard";

export function useBookingWizard(tenantId: string) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const bookingData = useBookingData();
  const navigation = useWizardNavigation();
  const calendar = useCalendar();
  const availability = useServiceAvailability(tenantId);

  const apiService = useMemo(() => new BookingApiService(tenantId), [tenantId]);

  // Fetch service availability when service is selected
  useEffect(() => {
    if (bookingData.bookingData.service?.id) {
      availability.fetchServiceAvailability(bookingData.bookingData.service.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.bookingData.service?.id]); // availability functions are stable

  // Generate available slots when date is selected
  useEffect(() => {
    if (calendar.selectedDate && bookingData.bookingData.service) {
      availability.generateAvailableSlots(
        calendar.selectedDate,
        bookingData.bookingData.service
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar.selectedDate, bookingData.bookingData.service]); // availability functions are stable

  const handleServiceSelect = useCallback(
    (service: Service) => {
      bookingData.updateBookingData({ service });
    },
    [bookingData]
  );

  const handleDateSelect = useCallback(
    (date: string) => {
      calendar.selectDate(date);
      bookingData.updateBookingData({ selectedDate: date });
    },
    [calendar, bookingData]
  );

  const handleTimeSelect = useCallback(
    (slot: AvailableSlot) => {
      bookingData.updateBookingData({
        selectedTime: slot.time,
        dateTime: slot.datetime,
      });
    },
    [bookingData]
  );

  const handleProfessionalSelect = useCallback(
    (professional: Professional) => {
      bookingData.updateBookingData({ professional });
    },
    [bookingData]
  );

  const handleBookingComplete = useCallback(async () => {
    // Validate all required fields
    const validationError = bookingData.getValidationError(6);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiService.createBooking(bookingData.bookingData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Error al crear la reserva");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Error de conexión al crear la reserva");
    } finally {
      setLoading(false);
    }
  }, [bookingData, apiService]);

  const handleRetrySlots = useCallback(() => {
    if (calendar.selectedDate && bookingData.bookingData.service) {
      availability.retryGenerateSlots(
        calendar.selectedDate,
        bookingData.bookingData.service
      );
    }
  }, [calendar.selectedDate, bookingData.bookingData.service, availability]);

  const isDateSelectable = useCallback(
    (date: Date) => {
      return calendar.isDateSelectable(date, availability.isDateAvailable);
    },
    [calendar, availability]
  );

  return {
    // State
    currentStep: navigation.currentStep,
    bookingData: bookingData.bookingData,
    selectedDate: calendar.selectedDate,
    currentMonth: calendar.currentMonth,
    availableSlots: availability.availableSlots,
    loading: loading || availability.loading,
    error: error || availability.error,
    success,
    hoveredService,

    // Navigation
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep,

    // Calendar
    monthDates: calendar.getMonthDates(),
    nextMonth: calendar.nextMonth,
    prevMonth: calendar.prevMonth,
    isDateInCurrentMonth: calendar.isDateInCurrentMonth,
    isDateSelectable,

    // Handlers
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleProfessionalSelect,
    handleBookingComplete,
    updateBookingData: bookingData.updateBookingData,
    setHoveredService,
    handleRetrySlots,

    // Validation
    validateStep: bookingData.validateStep,
    clearError: () => setError(""),
  };
}
