import React from "react";
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
import { cn } from "@/lib/utils";
import { TimeSelectorProps } from "../types";

export function TimeSelector({
  selectedDate,
  timeSlots,
  loadingSlots,
  onTimeSelect,
  getWorkingHoursForDate,
  selectedTime,
  professionalId,
}: TimeSelectorProps) {
  const renderContent = () => {
    if (!selectedDate) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            Seleccione una fecha para ver los bloques de tiempo disponibles
          </p>
        </div>
      );
    }

    if (loadingSlots) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin" />
          <p className="text-lg">Cargando horarios disponibles...</p>
        </div>
      );
    }

    if (timeSlots.length === 0) {
      return (
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
      );
    }

    return (
      <div>
        <div className="space-y-3 mb-4">
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
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
                onClick={() => isAvailable && onTimeSelect(slot.time)}
                disabled={!isAvailable}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="text-lg font-bold">{slot.time}</span>
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
          Bloques de tiempo del profesional. Al seleccionar un bloque, reservará
          todo el período indicado.
        </div>
      </div>
    );
  };

  const getCardDescription = () => {
    if (!selectedDate) {
      return "Por favor seleccione una fecha primero";
    }

    const workingHours = getWorkingHoursForDate(selectedDate);

    return (
      <div>
        <p>
          Bloques de tiempo para{" "}
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
        </p>
        {professionalId && professionalId !== "any" && (
          <p className="text-xs mt-1">
            {workingHours
              ? `Horarios disponibles: ${workingHours}`
              : "El profesional no trabaja este día"}
          </p>
        )}
        <p className="text-xs mt-1 font-medium text-green-800">
          Seleccione un bloque completo para su reserva
        </p>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="py-5">
        <CardTitle className="flex items-center space-x-2 text-xl text-green-900">
          <Clock className="h-6 w-6" />
          <span>Seleccionar Hora</span>
        </CardTitle>
        <CardDescription className="text-sm text-green-700">
          {getCardDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">{renderContent()}</CardContent>
    </Card>
  );
}
