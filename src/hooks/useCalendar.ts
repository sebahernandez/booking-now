import { useState, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from "date-fns";

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate("");
  }, []);

  const getMonthDates = useCallback(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const dates = eachDayOfInterval({ start, end });

    // Add padding days for complete calendar grid
    const startDate = new Date(start);
    const startPadding = startDate.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const paddingDate = new Date(start);
      paddingDate.setDate(paddingDate.getDate() - (i + 1));
      dates.unshift(paddingDate);
    }

    // Add ending padding days
    const endDate = new Date(end);
    const endPadding = 6 - endDate.getDay();
    for (let i = 1; i <= endPadding; i++) {
      const paddingDate = new Date(end);
      paddingDate.setDate(paddingDate.getDate() + i);
      dates.push(paddingDate);
    }

    return dates;
  }, [currentMonth]);

  const isDateInCurrentMonth = useCallback(
    (date: Date) => {
      return (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      );
    },
    [currentMonth]
  );

  const isDateSelectable = useCallback(
    (date: Date, isDateAvailable: (dayOfWeek: number) => boolean) => {
      const isCurrentMonth = isDateInCurrentMonth(date);
      const dayOfWeek = date.getDay();
      const hasServiceAvailability = isDateAvailable(dayOfWeek);
      const isPast = isBefore(date, startOfDay(new Date()));
      return isCurrentMonth && hasServiceAvailability && !isPast;
    },
    [isDateInCurrentMonth]
  );

  return {
    currentMonth,
    selectedDate,
    nextMonth,
    prevMonth,
    selectDate,
    clearSelection,
    getMonthDates,
    isDateInCurrentMonth,
    isDateSelectable,
    setCurrentMonth,
  };
}
