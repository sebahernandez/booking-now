'use client';

import React from 'react';
import { BookingProvider } from '@/providers/booking-provider';
import { BookingSidebar } from './booking-sidebar';
import { BookingContent } from './booking-content';

export function BookingWizard() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <BookingSidebar />
        <BookingContent />
      </div>
    </BookingProvider>
  );
}