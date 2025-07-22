export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  services: string[]; // service IDs
  availability?: ProfessionalAvailability;
}

export interface ProfessionalAvailability {
  id: string;
  professionalId: string;
  weeklySchedule: WeeklySchedule;
  exceptions: AvailabilityException[];
  timeZone?: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface AvailabilityException {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'unavailable' | 'custom_schedule';
  customSchedule?: TimeSlot[];
  reason?: string;
}

export interface BookingFormData {
  serviceId: string;
  professionalId?: string;
  date: Date | null;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface Step {
  id: string;
  title: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

export type BookingStep = 'service' | 'datetime' | 'information';

export interface TimeSlotAvailability {
  time: string;
  isAvailable: boolean;
  reason?: string; // e.g., "Reservado", "Fuera de horario"
}