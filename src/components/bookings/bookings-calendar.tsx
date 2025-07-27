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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendar de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={bookings}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  culture="es"
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
                      borderRadius: '6px',
                      opacity: event.status === 'CANCELLED' ? 0.6 : 1,
                      color: 'white',
                      border: 'none',
                      fontSize: '12px',
                    },
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedBooking ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de la Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedBooking.clientName}</p>
                      {selectedBooking.clientPhone && (
                        <p className="text-sm text-gray-600">{selectedBooking.clientPhone}</p>
                      )}
                      {selectedBooking.clientEmail && (
                        <p className="text-sm text-gray-600">{selectedBooking.clientEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedBooking.serviceName}</p>
                      <p className="text-sm text-gray-600">con {selectedBooking.professionalName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
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
              <CardContent className="p-6 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Selecciona una reserva</h3>
                <p className="text-sm text-gray-500">
                  Haz clic en una reserva del calendario para ver sus detalles
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total reservas:</span>
                  <span className="font-medium">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Confirmadas:</span>
                  <span className="font-medium text-green-600">
                    {bookings.filter(b => b.status === 'CONFIRMED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes:</span>
                  <span className="font-medium text-yellow-600">
                    {bookings.filter(b => b.status === 'PENDING').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completadas:</span>
                  <span className="font-medium text-blue-600">
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