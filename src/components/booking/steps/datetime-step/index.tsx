"use client";

import React, { useState, useEffect } from "react";
import { useBooking } from "@/providers/booking-provider";
import {
  DateTimeStepHeader,
  DateSelector,
  TimeSelector,
  BookingSummary,
} from "./components";
import { useDateTimeStep } from "./hooks/useDateTimeStep";

function DateTimeStepContent() {
  const { formData } = useBooking();
  const {
    selectedDate,
    timeSlots,
    loadingSlots,
    handleDateSelect,
    handleTimeSelect,
    disabledDays,
    getWorkingHoursForDate,
  } = useDateTimeStep();

  return (
    <div className="space-y-8">
      <DateTimeStepHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DateSelector
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          disabledDays={disabledDays}
        />

        <TimeSelector
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          loadingSlots={loadingSlots}
          onTimeSelect={handleTimeSelect}
          getWorkingHoursForDate={getWorkingHoursForDate}
          selectedTime={formData.time}
          professionalId={formData.professionalId}
        />
      </div>

      {formData.date && formData.time && (
        <BookingSummary date={formData.date} time={formData.time} />
      )}
    </div>
  );
}

export function DateTimeStep() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <DateTimeStepHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
        </div>
      </div>
    );
  }

  return <DateTimeStepContent />;
}
