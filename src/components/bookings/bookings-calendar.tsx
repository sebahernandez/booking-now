'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, User, MapPin } from 'lucide-react';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  professionalName: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
}

export function BookingsCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        const formattedBookings = data.map((booking: {
          id: string;
          service: { name: string; duration: number };
          clientName: string;
          clientPhone?: string;
          clientEmail?: string;
          professional?: { user?: { name?: string } };
          status: string;
          notes?: string;
          dateTime: string;
        }) => ({
          id: booking.id,
          title: `${booking.service.name} - ${booking.clientName}`,
          start: new Date(booking.dateTime),
          end: new Date(new Date(booking.dateTime).getTime() + booking.service.duration * 60000),
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          clientEmail: booking.clientEmail,
          serviceName: booking.service.name,
          professionalName: booking.professional?.user?.name || 'Sin asignar',
          status: booking.status,
          notes: booking.notes,
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Booking) => {
    setSelectedBooking(event);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendar de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-96 sm:h-[500px] lg:h-[600px] overflow-auto">
                <style jsx>{`
                  .rbc-calendar {
                    min-width: 100%;
                  }
                  .rbc-toolbar {
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                  }
                  .rbc-toolbar button {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.875rem;
                  }
                  .rbc-toolbar-label {
                    font-size: 1rem;
                    font-weight: 600;
                  }
                  @media (max-width: 640px) {
                    .rbc-toolbar {
                      flex-direction: column;
                      align-items: center;
                    }
                    .rbc-btn-group {
                      flex-wrap: wrap;
                      justify-content: center;
                    }
                    .rbc-header {
                      font-size: 0.75rem;
                      padding: 0.25rem;
                    }
                    .rbc-date-cell {
                      padding: 0.125rem;
                    }
                    .rbc-event {
                      font-size: 0.625rem !important;
                      padding: 1px 2px;
                    }
                  }
                `}</style>
                <Calendar
                  localizer={localizer}
                  events={bookings}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', minHeight: '400px' }}
                  onSelectEvent={handleSelectEvent}
                  culture="es"
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  messages={{
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    today: 'Hoy',
                    previous: 'Anterior',
                    next: 'Siguiente',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay reservas en este rango de fechas',
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.status === 'CONFIRMED' ? '#10b981' : 
                                     event.status === 'PENDING' ? '#f59e0b' :
                                     event.status === 'CANCELLED' ? '#ef4444' : '#3b82f6',
                      borderRadius: '4px',
                      opacity: event.status === 'CANCELLED' ? 0.6 : 1,
                      color: 'white',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'normal',
                    },
                  })}
                  step={30}
                  timeslots={2}
                  min={new Date(0, 0, 0, 8, 0, 0)}
                  max={new Date(0, 0, 0, 20, 0, 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">{selectedBooking ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Detalles de la Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start sm:items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{selectedBooking.clientName}</p>
                      {selectedBooking.clientPhone && (
                        <p className="text-sm text-gray-600 truncate">{selectedBooking.clientPhone}</p>
                      )}
                      {selectedBooking.clientEmail && (
                        <p className="text-sm text-gray-600 truncate">{selectedBooking.clientEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start sm:items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{selectedBooking.serviceName}</p>
                      <p className="text-sm text-gray-600 truncate">con {selectedBooking.professionalName}</p>
                    </div>
                  </div>

                  <div className="flex items-start sm:items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">
                        {format(selectedBooking.start, 'PPP', { locale: es })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(selectedBooking.start, 'HH:mm')} - {format(selectedBooking.end, 'HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedBooking.notes && (
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-1">Notas:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-words">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Selecciona una reserva</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Haz clic en una reserva del calendario para ver sus detalles
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total reservas:</span>
                  <span className="font-medium text-sm sm:text-base">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Confirmadas:</span>
                  <span className="font-medium text-green-600 text-sm sm:text-base">
                    {bookings.filter(b => b.status === 'CONFIRMED').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Pendientes:</span>
                  <span className="font-medium text-yellow-600 text-sm sm:text-base">
                    {bookings.filter(b => b.status === 'PENDING').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Completadas:</span>
                  <span className="font-medium text-blue-600 text-sm sm:text-base">
                    {bookings.filter(b => b.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}