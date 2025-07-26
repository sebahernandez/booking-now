"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useBooking } from "@/providers/booking-provider";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { format, addDays, startOfDay, isSameDay, isBefore } from "date-fns";
import { es } from "date-fns/locale";

interface TimeSlot {
  time: string;
  available: boolean;
}

// Client-side only component wrapper
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

function DateTimeStepContent() {
  const { formData, updateFormData, tenantId } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date ? new Date(formData.date) : undefined
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only execution
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate time slots (client-side only) - fallback method
  const generateTimeSlots = useMemo(() => {
    if (!isMounted) return () => [];

    return (date: Date): TimeSlot[] => {
      const slots: TimeSlot[] = [];

      // Simple working hours: 9 AM to 6 PM
      const startHour = 9;
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        for (const minutes of [0, 30]) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, minutes, 0, 0);

          // Check if slot is in the past (only for today)
          const now = new Date();
          const isToday = isSameDay(date, now);
          const isPast = isToday && isBefore(slotTime, now);

          // Skip lunch break (1-2 PM)
          const isLunchBreak = hour === 13;

          if (!isLunchBreak) {
            slots.push({
              time: format(slotTime, "HH:mm"),
              available: !isPast,
            });
          }
        }
      }

      return slots;
    };
  }, [isMounted]);

  // Fetch availability for selected service
  const fetchAvailability = useCallback(
    async (serviceId: string, date: Date) => {
      if (!isMounted || !tenantId) return [];

      try {
        setLoadingSlots(true);
        const dateStr = format(date, "yyyy-MM-dd");

        const response = await fetch(
          `/api/widget/tenant/${tenantId}/services/${serviceId}/availability?date=${dateStr}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }

        const data = await response.json();
        return data.availability || [];
      } catch (error) {
        console.error("Error fetching availability:", error);
        // Fallback to generated slots if API fails
        return generateTimeSlots(date);
      } finally {
        setLoadingSlots(false);
      }
    },
    [isMounted, tenantId, generateTimeSlots]
  );

  // Disabled days calculation (client-side only)
  const disabledDays = useMemo(() => {
    if (!isMounted) {
      return { before: new Date(), after: new Date() };
    }

    const today = startOfDay(new Date());
    const maxDate = addDays(today, 60); // 2 months ahead

    return {
      before: today,
      after: maxDate,
    };
  }, [isMounted]);

  // Load time slots when date changes or service changes
  useEffect(() => {
    if (!selectedDate || !isMounted || !formData.serviceId) return;

    const loadAvailability = async () => {
      try {
        const slots = await fetchAvailability(
          formData.serviceId!,
          selectedDate
        );
        setTimeSlots(slots);
      } catch (error) {
        console.error("Error loading availability:", error);
        // Fallback to generated slots
        const fallbackSlots = generateTimeSlots(selectedDate);
        setTimeSlots(fallbackSlots);
        setLoadingSlots(false);
      }
    };

    loadAvailability();
  }, [
    selectedDate,
    isMounted,
    formData.serviceId,
    fetchAvailability,
    generateTimeSlots,
  ]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !isMounted) return;

    setSelectedDate(date);
    updateFormData({
      date: date,
      time: "", // Reset time when date changes
    });
  };

  const handleTimeSelect = (time: string) => {
    if (!isMounted) return;

    updateFormData({ time });
  };

  // Safe date formatting (client-side only)
  const formatDateSafe = (date: Date, formatStr: string) => {
    if (!isMounted) return "";
    try {
      return format(date, formatStr, { locale: es });
    } catch {
      return "";
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm font-medium">Paso 2 de 3</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Selecciona fecha y hora
        </h2>
        <p className="text-gray-600">
          Elige el día y horario que mejor se adapte a tu agenda
          {formData.serviceId && (
            <span className="block mt-1 text-sm text-blue-600">
              Horarios específicos del servicio seleccionado
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Seleccionar Fecha
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              locale={es}
              className="rounded-md border-0"
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-md",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell:
                  "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                day: "h-9 w-9 p-0 font-normal hover:bg-blue-100 rounded-md transition-colors mx-auto",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "text-gray-400",
                day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                day_hidden: "invisible",
              }}
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Seleccionar Horario
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-gray-600">
                {formatDateSafe(selectedDate, "EEEE, d 'de' MMMM")}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Primero selecciona una fecha</p>
              </div>
            ) : loadingSlots ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600">Cargando horarios...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No hay horarios disponibles para esta fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={
                      formData.time === slot.time ? "default" : "outline"
                    }
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`
                      transition-all duration-200
                      ${
                        formData.time === slot.time
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-blue-50 hover:border-blue-300"
                      }
                      ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      {formData.date && formData.time && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              Resumen de tu cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {selectedDate &&
                      formatDateSafe(selectedDate, "EEEE, d 'de' MMMM")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-medium">{formData.time}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ✓ Horario confirmado
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DateTimeStep() {
  return (
    <ClientOnlyWrapper
      fallback={
        <div className="space-y-8">
          <div className="text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">
              Cargando paso de fecha y hora...
            </p>
          </div>
        </div>
      }
    >
      <DateTimeStepContent />
    </ClientOnlyWrapper>
  );
}
