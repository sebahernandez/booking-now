'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  user: {
    name: string;
  };
}

interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AvailableSlot {
  date: string;
  time: string;
  datetime: string;
  professional?: Professional;
}

interface BookingData {
  service?: Service;
  professional?: Professional;
  dateTime?: string;
  selectedDate?: string;
  selectedTime?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}

interface BookingWizardProps {
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

export function BookingWizard({
  tenantId,
  services,
  tenantServices,
  onBookingComplete,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [serviceAvailability, setServiceAvailability] = useState<ServiceAvailability[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const activeServices = services || tenantServices || [];

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Fetch service availability when service is selected
  useEffect(() => {
    if (bookingData.service?.id) {
      fetchServiceAvailability(bookingData.service.id);
    }
  }, [bookingData.service]);

  // Generate available slots when date is selected
  useEffect(() => {
    if (selectedDate && serviceAvailability.length > 0 && bookingData.service) {
      generateAvailableSlots(selectedDate);
    }
  }, [selectedDate, serviceAvailability, bookingData.service]);

  const fetchServiceAvailability = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/widget/tenant/${tenantId}/services/${serviceId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setServiceAvailability(data.availabilitySchedule || []);
      }
    } catch (error) {
      console.error('Error fetching service availability:', error);
      setError('Error al cargar los horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableSlots = async (date: string) => {
    if (!bookingData.service) return;
    
    try {
      setLoading(true);
      // Use the availability endpoint that now handles everything
      const response = await fetch(`/api/widget/tenant/${tenantId}/services/${bookingData.service.id}/availability?date=${date}`);

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.availability) {
          // Convert the availability data to our slot format
          const slots: AvailableSlot[] = data.availability
            .filter((slot: { available: boolean }) => slot.available)
            .map((slot: { time: string }) => ({
              date: date,
              time: slot.time,
              datetime: `${date}T${slot.time}:00`,
            }));
          
          setAvailableSlots(slots);
        } else {
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
        setError('Error al cargar los horarios disponibles');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Error al verificar disponibilidad');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    updateBookingData({ selectedDate: date });
  };

  const handleTimeSelect = (slot: AvailableSlot) => {
    updateBookingData({ 
      selectedTime: slot.time,
      dateTime: slot.datetime,
      professional: slot.professional 
    });
    nextStep();
  };

  const handleBookingComplete = async () => {
    if (!bookingData.service || !bookingData.dateTime || !bookingData.clientName || !bookingData.clientEmail) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/widget/tenant/${tenantId}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.service.id,
          professionalId: bookingData.professional?.id,
          dateTime: bookingData.dateTime,
          clientName: bookingData.clientName,
          clientEmail: bookingData.clientEmail,
          clientPhone: bookingData.clientPhone,
          notes: bookingData.notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setCurrentStep(5); // Success step
        if (onBookingComplete) {
          onBookingComplete(result);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Error de conexión al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getMonthDates = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getDatesForNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startOfDay(new Date()), i);
      dates.push({
        date: format(date, 'yyyy-MM-dd'),
        display: format(date, 'EEE dd/MM', { locale: es }),
        dayOfWeek: date.getDay(),
      });
    }
    return dates;
  };

  const isDateAvailable = (dayOfWeek: number) => {
    return serviceAvailability.some(av => av.dayOfWeek === dayOfWeek && av.isActive);
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Reserva tu cita
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Paso {Math.min(currentStep, 4)} de 4
              </span>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
            />
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="min-h-[500px]">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Qué servicio necesitas?</h2>
                <p className="text-gray-600">Elige el servicio perfecto para ti</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      bookingData.service?.id === service.id 
                        ? 'border-2 border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      updateBookingData({ service });
                      nextStep();
                    }}
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 mb-1">{service.name}</h4>
                          {service.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                          )}
                        </div>
                        {bookingData.service?.id === service.id && (
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">{service.duration} min</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                              minimumFractionDigits: 0,
                            }).format(service.price)}
                          </div>
                        </div>
                      </div>
                      
                      {hoveredService === service.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                            size="sm"
                          >
                            Seleccionar servicio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date and Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Cuándo te gustaría agendar?</h2>
                <p className="text-gray-600">Selecciona la fecha y hora que más te convenga</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Selecciona una fecha</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="font-medium text-gray-700 min-w-[120px] text-center">
                          {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Custom Calendar Grid */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {getMonthDates().map((date) => {
                          const dateString = format(date, 'yyyy-MM-dd');
                          const available = isDateAvailable(date.getDay()) && !isBefore(date, startOfDay(new Date()));
                          const isSelected = selectedDate === dateString;
                          const isTodayDate = isToday(date);
                          
                          return (
                            <button
                              key={dateString}
                              onClick={() => available && handleDateSelect(dateString)}
                              disabled={!available}
                              className={`
                                relative p-3 text-sm font-medium rounded-lg transition-all duration-200
                                ${
                                  !available
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : isTodayDate
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              {format(date, 'd')}
                              {isTodayDate && !isSelected && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Slots Section */}
                <div className="space-y-4">
                  {selectedDate ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Horarios disponibles
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {format(parseISO(selectedDate), 'EEEE, d \'de\' MMMM', { locale: es })}
                      </p>
                      
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-gray-500">Cargando horarios...</p>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                          {availableSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={bookingData.selectedTime === slot.time ? 'default' : 'outline'}
                              className={`h-12 font-medium transition-all duration-200 ${
                                bookingData.selectedTime === slot.time
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md'
                                  : 'hover:bg-blue-50 hover:border-blue-300'
                              }`}
                              onClick={() => handleTimeSelect(slot)}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500 mb-2">No hay horarios disponibles</p>
                          <p className="text-sm text-gray-400">Selecciona otra fecha</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">Selecciona una fecha</p>
                      <p className="text-sm text-gray-400">Los horarios disponibles aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick date options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Accesos rápidos:</h4>
                <div className="flex flex-wrap gap-2">
                  {getDatesForNext7Days().map((dateInfo) => {
                    const available = isDateAvailable(dateInfo.dayOfWeek);
                    return (
                      <Button
                        key={dateInfo.date}
                        variant={selectedDate === dateInfo.date ? 'default' : 'outline'}
                        size="sm"
                        disabled={!available}
                        onClick={() => available && handleDateSelect(dateInfo.date)}
                        className={`${
                          selectedDate === dateInfo.date
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-0'
                            : available
                            ? 'hover:bg-blue-50'
                            : 'opacity-50'
                        }`}
                      >
                        {dateInfo.display}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Resumen de tu reserva</h2>
                <p className="text-gray-600">Revisa los detalles antes de continuar</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{bookingData.service?.name}</h3>
                        <p className="text-blue-100">Tu cita está casi lista</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {bookingData.service && new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0,
                          }).format(bookingData.service.price)}
                        </div>
                        <div className="text-blue-100 text-sm">{bookingData.service?.duration} minutos</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-1">FECHA</label>
                          <div className="text-lg font-semibold text-gray-900">
                            {bookingData.selectedDate && format(parseISO(bookingData.selectedDate), 'EEEE, d \'de\' MMMM', { locale: es })}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-1">HORA</label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            {bookingData.selectedTime}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-1">SERVICIO</label>
                          <div className="text-lg font-semibold text-gray-900">{bookingData.service?.name}</div>
                        </div>
                        
                        {bookingData.service?.description && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">DESCRIPCIÓN</label>
                            <div className="text-sm text-gray-700">{bookingData.service.description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-700">Total a pagar:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {bookingData.service && new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0,
                          }).format(bookingData.service.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Información de contacto</h2>
                <p className="text-gray-600">Necesitamos algunos datos para confirmar tu reserva</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
                  <div>
                    <Label htmlFor="clientName" className="text-base font-medium text-gray-700">
                      Nombre completo *
                    </Label>
                    <Input
                      id="clientName"
                      type="text"
                      value={bookingData.clientName || ''}
                      onChange={(e) => updateBookingData({ clientName: e.target.value })}
                      placeholder="Tu nombre completo"
                      className="mt-2 h-12 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail" className="text-base font-medium text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={bookingData.clientEmail || ''}
                      onChange={(e) => updateBookingData({ clientEmail: e.target.value })}
                      placeholder="tu@email.com"
                      className="mt-2 h-12 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientPhone" className="text-base font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={bookingData.clientPhone || ''}
                      onChange={(e) => updateBookingData({ clientPhone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-base font-medium text-gray-700">
                      Notas adicionales
                    </Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      value={bookingData.notes || ''}
                      onChange={(e) => updateBookingData({ notes: e.target.value })}
                      placeholder="Información adicional (opcional)"
                      className="mt-2 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Success */}
          {currentStep === 5 && success && (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
              <h2 className="text-4xl font-bold text-green-800 mb-4">¡Reserva confirmada!</h2>
              <p className="text-xl text-gray-600 mb-8">Tu reserva ha sido creada exitosamente.</p>
              <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl p-6">
                <p className="text-green-800">
                  Recibirás un email de confirmación en <strong>{bookingData.clientEmail}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-3 text-base"
            >
              Anterior
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !bookingData.service) ||
                  (currentStep === 2 && !bookingData.dateTime) ||
                  (currentStep === 3)
                }
                className="px-8 py-3 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleBookingComplete}
                disabled={!bookingData.clientName || !bookingData.clientEmail || loading}
                className="px-8 py-3 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {loading ? 'Creando reserva...' : 'Confirmar Reserva'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}