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