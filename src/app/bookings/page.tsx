'use client';

import { BookingsCalendar } from '@/components/bookings/bookings-calendar';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar de Reservas</h1>
        <BookingsCalendar />
      </div>
    </div>
  );
}