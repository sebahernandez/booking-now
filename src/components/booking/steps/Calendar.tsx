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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 w-full h-fit max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">
          Selecciona una fecha
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevMonth}
            className="p-1 h-7 w-7"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="font-medium text-gray-700 min-w-[90px] text-center text-xs">
            {formatters.monthYear(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            className="p-1 h-7 w-7"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Custom Calendar Grid - Responsive height */}
      <div className="flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-1 text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
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
                  relative text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center 
                  h-8 sm:h-10 md:h-12 lg:h-14 min-h-[32px]
                  ${
                    !isCurrentMonth
                      ? "text-gray-200 cursor-not-allowed"
                      : !available
                      ? "text-gray-300 cursor-not-allowed bg-gray-50"
                      : isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : isTodayDate
                      ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700 border hover:border-green-200"
                  }
                `}
              >
                {formatters.dayNumber(date)}
                {isTodayDate && !isSelected && isCurrentMonth && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
                {available && !isSelected && !isTodayDate && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend - Compact */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">No disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
