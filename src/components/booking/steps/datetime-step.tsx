"use client";

import React, { useState } from "react";
import { useBooking } from "@/providers/booking-provider";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Selecciona fecha y hora
        </h2>
        <p className="text-gray-600 mt-2">
          Elige tu fecha y hora preferida para la cita.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleciona una fecha</CardTitle>
            <CardDescription>
              Disponible de lunes a viernes. Los fines de semana no están
              disponibles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seleciona una hora</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Horarios disponibles para ${format(
                    selectedDate,
                    "EEEE, d 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}`
                : "Por favor selecciona una fecha primero"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = formData.time === time;
                  const isUnavailable = isTimeUnavailable(time);

                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="justify-center"
                      onClick={() => handleTimeSelect(time)}
                      disabled={isUnavailable}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {time}
                      {/*  <Clock className="h-3 w-3 mr-1" />
                      {time}
                      {isUnavailable && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          Ocupado
                        </Badge>
                      )} */}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecciona una fecha para ver los horarios disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {formData.date && formData.time && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Cita programada para:
                </p>
                <p className="text-blue-700">
                  {format(formData.date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}{" "}
                  a las {formData.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
