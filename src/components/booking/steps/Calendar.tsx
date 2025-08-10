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
    <div className="bg-background rounded-xl shadow-sm border border-border p-2.5 w-full h-fit max-h-[65vh] flex flex-col">
      <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
       
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevMonth}
            className="p-1 h-6 w-6"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="font-medium text-foreground min-w-[85px] text-center text-xs">
            {formatters.monthYear(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            className="p-1 h-6 w-6"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Custom Calendar Grid - Responsive height */}
      <div className="flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-1 mb-1.5 flex-shrink-0">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-0.5 text-center text-xs font-medium text-muted-foreground"
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
                  h-7 sm:h-8 md:h-10 lg:h-11 min-h-[28px]
                  ${
                    !isCurrentMonth
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : !available
                      ? "text-muted-foreground/50 cursor-not-allowed bg-muted/30"
                      : isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isTodayDate
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground border hover:border-accent"
                  }
                `}
              >
                {formatters.dayNumber(date)}
                {isTodayDate && !isSelected && isCurrentMonth && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                )}
                {available && !isSelected && !isTodayDate && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend - Compact */}
        <div className="mt-1.5 pt-1.5 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <span className="text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
              <span className="text-muted-foreground">No disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
