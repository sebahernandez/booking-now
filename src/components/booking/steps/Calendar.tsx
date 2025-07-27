import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isToday } from "date-fns";
import { formatters } from "@/utils/booking-utils";

interface CalendarProps {
  currentMonth: Date;
  selectedDate: string;
  dates: Date[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: string) => void;
  isDateInCurrentMonth: (date: Date) => boolean;
  isDateSelectable: (date: Date) => boolean;
}

export function Calendar({
  currentMonth,
  selectedDate,
  dates,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  isDateInCurrentMonth,
  isDateSelectable,
}: CalendarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Selecciona una fecha
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevMonth}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-gray-700 min-w-[120px] text-center">
            {formatters.monthYear(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Custom Calendar Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dates.map((date) => {
            const dateString = format(date, "yyyy-MM-dd");
            const isCurrentMonth = isDateInCurrentMonth(date);
            const available = isDateSelectable(date);
            const isSelected = selectedDate === dateString;
            const isTodayDate = isToday(date);

            return (
              <button
                key={dateString}
                onClick={() => available && onDateSelect(dateString)}
                disabled={!available}
                className={`
                  relative p-3 text-sm font-medium rounded-lg transition-all duration-200 min-h-[40px]
                  ${
                    !isCurrentMonth
                      ? "text-gray-200 cursor-not-allowed"
                      : !available
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : isSelected
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : isTodayDate
                      ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700 border hover:border-green-200"
                  }
                `}
              >
                {formatters.dayNumber(date)}
                {isTodayDate && !isSelected && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
                {available && !isSelected && !isTodayDate && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">No disponible</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Selecciona un día para ver horarios disponibles
          </p>
        </div>
      </div>
    </div>
  );
}
