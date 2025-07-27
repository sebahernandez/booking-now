import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const formatters = {
  currency: (amount: number): string => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  },

  date: (dateString: string): string => {
    return format(parseISO(dateString), "EEEE, d 'de' MMMM", { locale: es });
  },

  monthYear: (date: Date): string => {
    return format(date, "MMMM yyyy", { locale: es });
  },

  dayNumber: (date: Date): string => {
    return format(date, "d");
  },
};

export const validators = {
  email: (email: string): boolean => {
    return email.trim() !== "" && email.includes("@");
  },

  required: (value: string): boolean => {
    return value.trim() !== "";
  },

  name: (name: string): boolean => {
    return validators.required(name);
  },

  phone: (phone?: string): boolean => {
    // Phone is optional, so if empty it's valid
    return !phone || phone.trim() !== "";
  },
};

export const messages = {
  loading: {
    availability: "Cargando horarios...",
    professionals: "Cargando profesionales...",
    booking: "Creando reserva...",
  },

  errors: {
    noService: "Por favor selecciona un servicio",
    noDateTime: "Por favor selecciona una fecha y hora",
    noProfessional: "Por favor selecciona un profesional",
    noName: "Por favor ingresa tu nombre completo",
    invalidEmail: "Por favor ingresa un email válido",
    noTerms: "Debes aceptar los términos y condiciones",
    availabilityLoad: "Error al cargar los horarios disponibles",
    availabilityCheck: "Error al verificar disponibilidad",
    bookingCreate: "Error al crear la reserva",
    connectionError: "Error de conexión al crear la reserva",
  },

  success: {
    bookingCreated: "¡Reserva confirmada!",
    bookingDescription: "Tu reserva ha sido creada exitosamente.",
    emailConfirmation: "Recibirás un email de confirmación en",
  },

  placeholders: {
    name: "Tu nombre completo",
    email: "tu@email.com",
    phone: "+56 9 1234 5678",
    notes: "Información adicional (opcional)",
  },
};
