"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { BookingWizardProps } from "@/types/booking-wizard";
import { useBookingWizard } from "@/hooks/useBookingWizard";

// Step Components
import { ServiceSelection } from "./steps/ServiceSelection";
import { Calendar } from "./steps/Calendar";
import { TimeSelection } from "./steps/TimeSelection";
import { ProfessionalSelection } from "./steps/ProfessionalSelection";
import { ContactForm } from "./steps/ContactForm";
import { BookingSummary } from "./steps/BookingSummary";
import { SuccessMessage } from "./steps/SuccessMessage";

export function BookingWizard({
  tenantId,
  services,
  tenantServices,
  onBookingComplete,
}: BookingWizardProps) {
  const activeServices = services || tenantServices || [];

  const {
    currentStep,
    bookingData,
    selectedDate,
    currentMonth,
    availableSlots,
    loading,
    error,
    success,
    hoveredService,
    nextStep,
    prevStep,
    monthDates,
    nextMonth,
    prevMonth,
    isDateInCurrentMonth,
    isDateSelectable,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleProfessionalSelect,
    handleBookingComplete,
    updateBookingData,
    setHoveredService,
    validateStep,
    clearError,
  } = useBookingWizard(tenantId);

  const handleFormSubmit = () => {
    // Ensure all form data is captured before validation
    const nameField = document.getElementById("clientName") as HTMLInputElement;
    const emailField = document.getElementById(
      "clientEmail"
    ) as HTMLInputElement;
    const phoneField = document.getElementById(
      "clientPhone"
    ) as HTMLInputElement;
    const notesField = document.getElementById("notes") as HTMLTextAreaElement;
    const termsField = document.getElementById(
      "acceptedTerms"
    ) as HTMLInputElement;

    if (nameField) updateBookingData({ clientName: nameField.value.trim() });
    if (emailField) updateBookingData({ clientEmail: emailField.value.trim() });
    if (phoneField) updateBookingData({ clientPhone: phoneField.value.trim() });
    if (notesField) updateBookingData({ notes: notesField.value.trim() });
    if (termsField) updateBookingData({ acceptedTerms: termsField.checked });

    setTimeout(() => {
      handleBookingComplete().then(() => {
        if (onBookingComplete) {
          onBookingComplete(bookingData);
        }
      });
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Reserva tu cita
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {success ? "Completado" : `Paso ${currentStep} de 4`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${success ? 100 : (currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-700">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="min-h-[500px]">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <ServiceSelection
              services={activeServices}
              selectedService={bookingData.service}
              hoveredService={hoveredService}
              onServiceSelect={handleServiceSelect}
              onServiceHover={setHoveredService}
            />
          )}

          {/* Step 2: Date and Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ¿Cuándo te gustaría agendar?
                </h2>
                <p className="text-gray-600">
                  Selecciona la fecha y hora que más te convenga
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Calendar
                    currentMonth={currentMonth}
                    selectedDate={selectedDate}
                    dates={monthDates}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onDateSelect={handleDateSelect}
                    isDateInCurrentMonth={isDateInCurrentMonth}
                    isDateSelectable={isDateSelectable}
                  />
                </div>

                <div className="space-y-4">
                  <TimeSelection
                    selectedDate={selectedDate}
                    availableSlots={availableSlots}
                    selectedTime={bookingData.selectedTime}
                    loading={loading}
                    onTimeSelect={handleTimeSelect}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Selection */}
          {currentStep === 3 && (
            <ProfessionalSelection
              bookingData={bookingData}
              availableSlots={availableSlots}
              selectedProfessional={bookingData.professional}
              loading={loading}
              onProfessionalSelect={handleProfessionalSelect}
              onBackToTime={prevStep}
            />
          )}

          {/* Step 4: Contact Information & Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Información de contacto
                </h2>
                <p className="text-gray-600">
                  Completa tus datos para confirmar la reserva
                </p>
              </div>

              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BookingSummary bookingData={bookingData} />
                <ContactForm
                  bookingData={bookingData}
                  onUpdateData={updateBookingData}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && <SuccessMessage clientEmail={bookingData.clientEmail} />}
        </div>

        {/* Navigation Buttons */}
        {!success && (
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
                disabled={!validateStep(currentStep)}
                className="px-8 py-3 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleFormSubmit}
                disabled={loading}
                className="px-8 py-3 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {loading ? "Creando reserva..." : "Confirmar Reserva"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
