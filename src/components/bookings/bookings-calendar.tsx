"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card } from "@/components/ui/card";

const localizer = momentLocalizer(moment);

// Configure moment for Spanish
moment.locale("es");

interface BookingEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    professionalName?: string;
    status: string;
    price: number;
    notes?: string;
  };
}

interface Booking {
  id: string;
  startDateTime: string;
  endDateTime: string;
  totalPrice: number;
  notes?: string;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  professional?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  service: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
  };
}

export function BookingsCalendar() {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const bookings: Booking[] = await response.json();
        const formattedEvents: BookingEvent[] = bookings.map((booking) => ({
          id: booking.id,
          title: `${booking.service.name} - ${booking.client.name}`,
          start: new Date(booking.startDateTime),
          end: new Date(booking.endDateTime),
          resource: {
            id: booking.id,
            clientName: booking.client.name,
            clientEmail: booking.client.email,
            serviceName: booking.service.name,
            professionalName: booking.professional?.user.name,
            status: booking.status,
            price: booking.totalPrice,
            notes: booking.notes,
          },
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = "#3174ad";

    switch (event.resource.status) {
      case "CONFIRMED":
        backgroundColor = "#10b981"; // green
        break;
      case "PENDING":
        backgroundColor = "#f59e0b"; // yellow
        break;
      case "CANCELLED":
        backgroundColor = "#ef4444"; // red
        break;
      case "COMPLETED":
        backgroundColor = "#6b7280"; // gray
        break;
      default:
        backgroundColor = "#3174ad"; // blue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando reservas...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div style={{ height: "600px" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango",
            }}
            formats={{
              monthHeaderFormat: "MMMM YYYY",
              dayHeaderFormat: "dddd, DD MMMM",
              dayRangeHeaderFormat: ({
                start,
                end,
              }: {
                start: Date;
                end: Date;
              }) =>
                `${moment(start).format("DD MMMM")} - ${moment(end).format(
                  "DD MMMM YYYY"
                )}`,
            }}
          />
        </div>
      </Card>

      {selectedEvent && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalles de la Reserva
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-gray-900">
                  {selectedEvent.resource.clientName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedEvent.resource.clientEmail}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Servicio</p>
                <p className="text-gray-900">
                  {selectedEvent.resource.serviceName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fecha y Hora
                </p>
                <p className="text-gray-900">
                  {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")} -{" "}
                  {moment(selectedEvent.end).format("HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedEvent.resource.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : selectedEvent.resource.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedEvent.resource.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : selectedEvent.resource.status === "COMPLETED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedEvent.resource.status}
                </span>
              </div>
              {selectedEvent.resource.professionalName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Profesional
                  </p>
                  <p className="text-gray-900">
                    {selectedEvent.resource.professionalName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Precio</p>
                <p className="text-gray-900">${selectedEvent.resource.price}</p>
              </div>
            </div>
            {selectedEvent.resource.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Notas</p>
                <p className="text-gray-900">{selectedEvent.resource.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Cancelada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Completada</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
