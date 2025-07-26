import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookingSummaryProps } from "../types";

export function BookingSummary({ date, time }: BookingSummaryProps) {
  return (
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
              {format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </p>
            <p className="text-lg text-green-700">
              Horario: <span className="font-semibold">{time}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              Se ha reservado todo el bloque de tiempo indicado
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
