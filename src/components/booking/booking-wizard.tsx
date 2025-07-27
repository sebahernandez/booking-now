'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

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

interface BookingData {
  service?: Service;
  professional?: Professional;
  dateTime?: string;
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
  isWidget,
  services,
  professionals,
  tenantServices,
  tenantProfessionals,
  tenantInfo,
  onBookingComplete,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const activeServices = services || tenantServices || [];
  const activeProfessionals = professionals || tenantProfessionals || [];

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleBookingComplete = async () => {
    if (onBookingComplete) {
      onBookingComplete(bookingData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nueva Reserva</h2>
              <div className="text-sm text-gray-500">
                Paso {currentStep} de 3
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Selecciona un servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer border-2 transition-colors ${
                        bookingData.service?.id === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        updateBookingData({ service });
                        nextStep();
                      }}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">{service.duration} min</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                              minimumFractionDigits: 0,
                            }).format(service.price)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Selecciona fecha y hora</h3>
                <div className="text-center py-12">
                  <p className="text-gray-500">Calendario de disponibilidad</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Componente de calendario aquí
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Información de contacto</h3>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre completo</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      value={bookingData.clientName || ''}
                      onChange={(e) => updateBookingData({ clientName: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      value={bookingData.clientEmail || ''}
                      onChange={(e) => updateBookingData({ clientEmail: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      value={bookingData.clientPhone || ''}
                      onChange={(e) => updateBookingData({ clientPhone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Notas adicionales</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md"
                      rows={3}
                      value={bookingData.notes || ''}
                      onChange={(e) => updateBookingData({ notes: e.target.value })}
                      placeholder="Información adicional (opcional)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !bookingData.service}
                className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleBookingComplete}
                disabled={!bookingData.clientName || !bookingData.clientEmail}
                className="px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Reserva
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}