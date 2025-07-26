import React, { useState, useEffect, useCallback } from "react";
import { useBooking } from "@/providers/booking-provider";
import { TimeSlotAvailability } from "@/types/booking";
import { ProfessionalSchedule, ParsedTimeSlot } from "../types";

export function useDateTimeStep() {
  const { formData, updateFormData } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date || undefined
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [professionalSchedule, setProfessionalSchedule] =
    useState<ProfessionalSchedule | null>(null);
  
  // Add ref to track ongoing API calls to prevent race conditions
  const isLoadingRef = React.useRef(false);

  // Parse selected time slot information
  const parseSelectedTimeSlot = useCallback(
    (selectedTimeSlot?: string): ParsedTimeSlot | null => {
      if (!selectedTimeSlot) return null;

      const [dayOfWeek, startTime, endTime] = selectedTimeSlot.split("-");
      return {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
      };
    },
    []
  );

  const selectedTimeSlotInfo = parseSelectedTimeSlot(formData.selectedTimeSlot);

  // Fetch professional schedule
  const fetchProfessionalSchedule = useCallback(
    async (professionalId: string) => {
      try {
        const response = await fetch(
          `/api/professionals/availability/${professionalId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalSchedule(data);
        }
      } catch (error) {
        console.error("Error fetching professional schedule:", error);
      }
    },
    []
  );

  // Generate time slots for selected schedule
  const generateTimeSlotsForSelectedSchedule = useCallback(
    (startTime: string, endTime: string, duration: number) => {
      const slots: TimeSlotAvailability[] = [];
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let currentTime = startHour * 60 + startMinute; // minutes from midnight
      const endTimeMinutes = endHour * 60 + endMinute;

      while (currentTime + duration <= endTimeMinutes) {
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        slots.push({
          time: timeString,
          isAvailable: true,
        });

        currentTime += 30; // slots de 30 minutos
      }

      return slots;
    },
    []
  );

  // Check time slot availability
  const checkTimeSlotAvailability = useCallback(
    async (
      date: Date,
      startTime: string,
      endTime: string,
      professionalId?: string
    ): Promise<boolean> => {
      try {
        // Create start and end DateTime objects
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        const startDateTime = new Date(date);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endDateTime = new Date(date);
        endDateTime.setHours(endHours, endMinutes, 0, 0);

        // Check for existing bookings
        const params = new URLSearchParams({
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
        });

        if (professionalId && professionalId !== "any") {
          params.append("professionalId", professionalId);
        }

        if (formData.serviceId) {
          params.append("serviceId", formData.serviceId);
        }

        const response = await fetch(
          `/api/bookings/check-availability?${params}`
        );
        if (response.ok) {
          const result = await response.json();
          return result.isAvailable;
        }

        // If API call fails, assume available (fallback)
        return true;
      } catch (error) {
        console.error("Error checking time slot availability:", error);
        return true; // Fallback to available if check fails
      }
    },
    [formData.serviceId]
  );

  // Fetch available slots for a specific date
  const fetchAvailableSlots = useCallback(
    async (date: Date) => {
      // Prevent multiple simultaneous calls that can cause page reloads
      if (isLoadingRef.current) {
        return;
      }
      
      isLoadingRef.current = true;
      setLoadingSlots(true);
      try {
        // Si tenemos un horario específico seleccionado del servicio, usar eso
        if (selectedTimeSlotInfo) {
          // Verificar que la fecha seleccionada corresponde al día de la semana del horario
          const dayOfWeek = date.getDay();
          if (dayOfWeek === selectedTimeSlotInfo.dayOfWeek) {
            // Buscar información del servicio para obtener la duración
            const serviceResponse = await fetch(
              `/api/services/${formData.serviceId}`
            );
            if (serviceResponse.ok) {
              const serviceData = await serviceResponse.json();
              const { startTime, endTime } = selectedTimeSlotInfo;
              const slots = generateTimeSlotsForSelectedSchedule(
                startTime,
                endTime,
                serviceData.duration
              );
              setTimeSlots(slots);
            }
          } else {
            // La fecha no corresponde al día del horario seleccionado
            setTimeSlots([]);
          }
          setLoadingSlots(false);
          return;
        }

        // Si no hay horario específico (servicio 24/7), usar la lógica original
        if (formData.professionalId && formData.professionalId !== "any") {
          const response = await fetch(
            `/api/professionals/availability/${formData.professionalId}`
          );
          if (response.ok) {
            const scheduleData = await response.json();
            const dayOfWeek = date.getDay();
            const dayNames = [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ];
            const dayName = dayNames[dayOfWeek];
            const daySchedule = scheduleData.weeklySchedule[dayName];

            if (daySchedule?.isWorking && daySchedule.timeSlots?.length > 0) {
              // Convert time slots to available blocks and check for existing bookings
              const availableBlocks = await Promise.all(
                daySchedule.timeSlots.map(
                  async (slot: { startTime: string; endTime: string }) => {
                    const timeRange = `${slot.startTime} - ${slot.endTime}`;

                    // Check if this time block has any existing bookings
                    const isAvailable = await checkTimeSlotAvailability(
                      date,
                      slot.startTime,
                      slot.endTime,
                      formData.professionalId
                    );

                    return {
                      time: timeRange,
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      isAvailable,
                    };
                  }
                )
              );
              setTimeSlots(availableBlocks);
            } else {
              setTimeSlots([]);
            }
          } else {
            setTimeSlots([]);
          }
        } else {
          // Para "cualquier profesional", mostrar horarios por defecto o del servicio
          if (selectedTimeSlotInfo) {
            // Generar slots basados en el horario del servicio
            const serviceResponse = await fetch(
              `/api/services/${formData.serviceId}`
            );
            if (serviceResponse.ok) {
              const serviceData = await serviceResponse.json();
              const { startTime, endTime } = selectedTimeSlotInfo;
              const slots = generateTimeSlotsForSelectedSchedule(
                startTime,
                endTime,
                serviceData.duration
              );
              setTimeSlots(slots);
            }
          } else {
            // Horarios por defecto para servicios 24/7
            const defaultBlocks = [
              {
                time: "09:00 - 12:00",
                startTime: "09:00",
                endTime: "12:00",
                isAvailable: true,
              },
              {
                time: "14:00 - 18:00",
                startTime: "14:00",
                endTime: "18:00",
                isAvailable: true,
              },
            ];
            setTimeSlots(defaultBlocks);
          }
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
        isLoadingRef.current = false;
      }
    },
    [
      formData.professionalId,
      formData.serviceId,
      selectedTimeSlotInfo,
      generateTimeSlotsForSelectedSchedule,
      checkTimeSlotAvailability,
    ]
  );

  // Get working hours for a specific date
  const getWorkingHoursForDate = useCallback(
    (date: Date): string | null => {
      if (!professionalSchedule) return null;

      const dayOfWeek = date.getDay();
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayName = dayNames[dayOfWeek];
      const daySchedule = professionalSchedule.weeklySchedule[dayName];

      if (!daySchedule?.isWorking || !daySchedule.timeSlots?.length) {
        return null;
      }

      // Combine all time slots into a readable format
      const timeRanges = daySchedule.timeSlots
        .map((slot) => `${slot.startTime} - ${slot.endTime}`)
        .join(", ");

      return timeRanges;
    },
    [professionalSchedule]
  );

  // Date validation functions
  const isWeekend = useCallback((date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }, []);

  const isPastDate = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  const disabledDays = useCallback(
    (date: Date) => {
      return isPastDate(date) || isWeekend(date);
    },
    [isPastDate, isWeekend]
  );

  // Event handlers
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      // Prevent multiple rapid calls that can cause page reloads
      setSelectedDate(date);
      updateFormData({ date, time: "" }); // Reset time when date changes

      if (date) {
        // Use setTimeout to prevent blocking the UI and potential hydration issues
        setTimeout(() => {
          fetchAvailableSlots(date);
        }, 0);
      }
    },
    [updateFormData, fetchAvailableSlots]
  );

  const handleTimeSelect = useCallback(
    (time: string) => {
      updateFormData({ time });
    },
    [updateFormData]
  );

  // Effects
  useEffect(() => {
    if (formData.professionalId && formData.professionalId !== "any") {
      fetchProfessionalSchedule(formData.professionalId);
    } else {
      setProfessionalSchedule(null);
    }
  }, [formData.professionalId, fetchProfessionalSchedule]);

  useEffect(() => {
    if (selectedDate && !isLoadingRef.current) {
      // Add small delay to prevent rapid fire calls
      const timer = setTimeout(() => {
        fetchAvailableSlots(selectedDate);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDate, fetchAvailableSlots]);

  return {
    selectedDate,
    timeSlots,
    loadingSlots,
    professionalSchedule,
    handleDateSelect,
    handleTimeSelect,
    disabledDays,
    getWorkingHoursForDate,
  };
}
