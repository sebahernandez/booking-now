export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface Professional {
  id: string;
  user: {
    name: string;
  };
}

export interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AvailableSlot {
  date: string;
  time: string;
  datetime: string;
  professional?: Professional;
  professionals?: Professional[];
}

export interface BookingData {
  service?: Service;
  professional?: Professional;
  dateTime?: string;
  selectedDate?: string;
  selectedTime?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  acceptedTerms?: boolean;
}

export interface BookingWizardProps {
  tenantId: string;
  isWidget?: boolean;
  services?: Service[];
  professionals?: Professional[];
  tenantServices?: Service[];
  tenantProfessionals?: Professional[];
  tenantInfo?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  onBookingComplete?: (booking: BookingData) => void;
}

export interface BookingState {
  currentStep: number;
  bookingData: BookingData;
  serviceAvailability: ServiceAvailability[];
  availableSlots: AvailableSlot[];
  selectedDate: string;
  currentMonth: Date;
  loading: boolean;
  error: string;
  success: boolean;
  hoveredService: string | null;
}
