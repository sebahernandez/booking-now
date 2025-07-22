'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingFormData, BookingStep } from '@/types/booking';

interface BookingContextType {
  currentStep: BookingStep;
  formData: Partial<BookingFormData>;
  setCurrentStep: (step: BookingStep) => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const steps: BookingStep[] = ['service', 'datetime', 'information'];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!formData.serviceId;
      case 'datetime':
        return !!(formData.date && formData.time);
      case 'information':
        return !!(formData.customerName && formData.customerEmail);
      default:
        return false;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        formData,
        setCurrentStep,
        updateFormData,
        nextStep,
        previousStep,
        canProceed: canProceed(),
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}