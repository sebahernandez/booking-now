import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface CustomCalendarProps {
  selected?: Date;
  onSelect: (date?: Date) => void;
  disabled: (date: Date) => boolean;
}

export function CustomCalendar({
  selected,
  onSelect,
  disabled,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentMonth(new Date());
  }, []);

  if (!isClient || !currentMonth) {
    return (
      <div className="p-4 h-80 flex items-center justify-center">
        Cargando calendario...
      </div>
    );
  }

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
    <div className="p-4" suppressHydrationWarning={true}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold" suppressHydrationWarning={true}>
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          type="button"
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
        {allDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selected && isSameDay(date, selected);
          const isDisabled = disabled(date);
          const isTodayDate = isToday(date);

          return (
            <Button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              type="button"
              className={cn(
                "h-10 w-10 p-0",
                !isCurrentMonth && "text-gray-300",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                isTodayDate && !isSelected && "bg-blue-50 text-blue-600",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onSelect(date)}
              disabled={isDisabled}
              suppressHydrationWarning={true}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
