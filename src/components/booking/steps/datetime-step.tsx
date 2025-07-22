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

// Mock available time slots
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// Mock unavailable times (in real app this would come from API)
const unavailableTimes = ["10:00", "14:30", "16:00"];

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

export function DateTimeStep() {
  const { formData, updateFormData } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date || undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateFormData({ date, time: "" }); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    updateFormData({ time });
  };

  const isTimeUnavailable = (time: string) => {
    return unavailableTimes.includes(time);
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
              {selectedDate
                ? `Horarios disponibles para ${format(
                    selectedDate,
                    "EEEE, d 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}`
                : "Por favor seleccione una fecha primero"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedDate ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = formData.time === time;
                  const isUnavailable = isTimeUnavailable(time);

                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "h-12 justify-center relative",
                        isSelected &&
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        isUnavailable && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isUnavailable && handleTimeSelect(time)}
                      disabled={isUnavailable}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {time}
                      {isUnavailable && (
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
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Seleccione una fecha para ver los horarios disponibles
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
                  ¡Cita Programada!
                </p>
                <p className="text-xl font-bold text-green-800">
                  {format(formData.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
                <p className="text-lg text-green-700">
                  a las <span className="font-semibold">{formData.time}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
