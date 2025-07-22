"use client";

import React, { useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TimeSlotAvailability } from "@/types/booking";

// Custom calendar component
function CustomCalendar({
  selected,
  onSelect,
  disabled,
}: {
  selected?: Date;
  onSelect: (date?: Date) => void;
  disabled: (date: Date) => boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous month to fill the week
  const firstDayOfWeek = monthStart.getDay();
  const daysFromPrevMonth = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (i + 1));
    daysFromPrevMonth.push(date);
  }

  // Add days from next month to fill the week
  const lastDayOfWeek = monthEnd.getDay();
  const daysFromNextMonth = [];
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    daysFromNextMonth.push(date);
  }

  const allDays = [...daysFromPrevMonth, ...daysInMonth, ...daysFromNextMonth];

  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {allDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selected && isSameDay(date, selected);
          const isDisabled = disabled(date);
          const isTodayDate = isToday(date);

          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-10 w-10 p-0",
                !isCurrentMonth && "text-gray-300",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                isTodayDate && !isSelected && "bg-blue-50 text-blue-600",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onSelect(date)}
              disabled={isDisabled}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

interface ProfessionalSchedule {
  weeklySchedule: {
    [key: string]: {
      isWorking: boolean;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
      }>;
    };
  };
}

export function DateTimeStep() {
  const { formData, updateFormData } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date || undefined
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [professionalSchedule, setProfessionalSchedule] =
    useState<ProfessionalSchedule | null>(null);

  const fetchProfessionalSchedule = React.useCallback(
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

  const fetchAvailableSlots = React.useCallback(async (date: Date) => {
    setLoadingSlots(true);
    try {
      // Instead of fetching individual time slots, we'll get the professional's schedule
      // and show full time blocks for reservation
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
        // For "any professional", show default time blocks
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
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Function to check if a time slot is available
  const checkTimeSlotAvailability = React.useCallback(
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

  // Fetch professional's working hours when professional changes
  React.useEffect(() => {
    if (formData.professionalId && formData.professionalId !== "any") {
      fetchProfessionalSchedule(formData.professionalId);
    } else {
      setProfessionalSchedule(null);
    }
  }, [formData.professionalId, fetchProfessionalSchedule]);

  // Fetch available slots when professional or service changes
  React.useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  const getWorkingHoursForDate = (date: Date): string | null => {
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
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    updateFormData({ date, time: "" }); // Reset time when date changes

    if (date) {
      await fetchAvailableSlots(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    updateFormData({ time });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const disabledDays = (date: Date) => {
    return isPastDate(date) || isWeekend(date);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Seleccionar Fecha y Hora
        </h2>
        <p className="text-xl text-gray-600">
          Elija su fecha y hora preferida para la cita.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-2">
          <CardHeader className="py-5">
            <CardTitle className="flex items-center space-x-2 text-xl text-blue-900">
              <CalendarIcon className="h-6 w-6" />
              <span>Seleccionar Fecha</span>
            </CardTitle>
            <CardDescription className="text-sm text-blue-700">
              Disponible de lunes a viernes. Los fines de semana no están
              disponibles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CustomCalendar
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader className="py-5">
            <CardTitle className="flex items-center space-x-2 text-xl text-green-900">
              <Clock className="h-6 w-6" />
              <span>Seleccionar Hora</span>
            </CardTitle>
            <CardDescription className="text-sm text-green-700">
              {selectedDate ? (
                <div>
                  <p>
                    Bloques de tiempo para{" "}
                    {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </p>
                  {formData.professionalId &&
                    formData.professionalId !== "any" && (
                      <p className="text-xs mt-1">
                        {(() => {
                          const workingHours =
                            getWorkingHoursForDate(selectedDate);
                          return workingHours
                            ? `Horarios disponibles: ${workingHours}`
                            : "El profesional no trabaja este día";
                        })()}
                      </p>
                    )}
                  <p className="text-xs mt-1 font-medium text-green-800">
                    Seleccione un bloque completo para su reserva
                  </p>
                </div>
              ) : (
                "Por favor seleccione una fecha primero"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedDate ? (
              <div>
                {loadingSlots ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin" />
                    <p className="text-lg">Cargando horarios disponibles...</p>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div>
                    <div className="space-y-3 mb-4">
                      {timeSlots.map((slot) => {
                        const isSelected = formData.time === slot.time;
                        const isAvailable = slot.isAvailable;

                        return (
                          <Button
                            key={slot.time}
                            variant={isSelected ? "default" : "outline"}
                            size="lg"
                            className={cn(
                              "w-full h-16 justify-center relative text-base font-medium",
                              isSelected &&
                                isAvailable &&
                                "bg-blue-600 hover:bg-blue-700 text-white",
                              !isAvailable &&
                                "opacity-60 cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100"
                            )}
                            onClick={() =>
                              isAvailable && handleTimeSelect(slot.time)
                            }
                            disabled={!isAvailable}
                          >
                            <div className="flex flex-col items-center">
                              <div className="flex items-center mb-1">
                                <Clock className="h-5 w-5 mr-2" />
                                <span className="text-lg font-bold">
                                  {slot.time}
                                </span>
                              </div>
                              <span className="text-xs opacity-75">
                                Bloque completo de tiempo
                              </span>
                            </div>
                            {!isAvailable && (
                              <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 text-xs px-1"
                              >
                                Ocupado
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Bloques de tiempo del profesional. Al seleccionar un
                      bloque, reservará todo el período indicado.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      No hay bloques de tiempo disponibles para esta fecha
                    </p>
                    <p className="text-sm">
                      El profesional no trabaja este día o ya tiene reservas
                    </p>
                    <p className="text-sm">Pruebe con otra fecha</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Seleccione una fecha para ver los bloques de tiempo
                  disponibles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {formData.date && formData.time && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <CardContent className="pt-8">
            <div className="flex items-left justify-left space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-green-900 mb-2">
                  ¡Bloque de Tiempo Reservado!
                </p>
                <p className="text-xl font-bold text-green-800">
                  {format(formData.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
                <p className="text-lg text-green-700">
                  Horario:{" "}
                  <span className="font-semibold">{formData.time}</span>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Se ha reservado todo el bloque de tiempo indicado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
