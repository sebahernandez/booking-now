import { TimeSlotAvailability } from "@/types/booking";

export interface ProfessionalSchedule {
  weeklySchedule: {
    [key: string]: {
      isWorking: boolean;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
      }>;
    };
  };
}

export interface ParsedTimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DateSelectorProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  disabledDays: (date: Date) => boolean;
}

export interface TimeSelectorProps {
  selectedDate?: Date;
  timeSlots: TimeSlotAvailability[];
  loadingSlots: boolean;
  onTimeSelect: (time: string) => void;
  getWorkingHoursForDate: (date: Date) => string | null;
  selectedTime?: string;
  professionalId?: string;
}

export interface BookingSummaryProps {
  date: Date;
  time: string;
}
