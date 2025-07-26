import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { CustomCalendar } from "./CustomCalendar";
import { DateSelectorProps } from "../types";

export function DateSelector({
  selectedDate,
  onDateSelect,
  disabledDays,
}: DateSelectorProps) {
  return (
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
          onSelect={onDateSelect}
          disabled={disabledDays}
        />
      </CardContent>
    </Card>
  );
}
