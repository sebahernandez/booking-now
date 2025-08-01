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
    handleRetrySlots,
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
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-white h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Reserva tu cita
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {success ? "Completado" : `Paso ${currentStep} de 6`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${success ? 100 : (currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto p-1 h-6 w-6"
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 flex-1 overflow-y-auto">
        <div className="h-full flex flex-col">
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

          {/* Step 2: Date Selection Only */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-4 flex-shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  ¿Qué día te gustaría agendar?
                </h2>
                <p className="text-gray-600 text-sm">
                  Selecciona la fecha que más te convenga
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
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
              </div>
            </div>
          )}

          {/* Step 3: Time Selection Only */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-4 flex-shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  ¿A qué hora prefieres tu cita?
                </h2>
                <p className="text-gray-600 text-sm">
                  Horarios disponibles para {selectedDate && new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex-1 flex items-start justify-center overflow-y-auto">
                <div className="w-full max-w-md">
                  <TimeSelection
                    selectedDate={selectedDate}
                    availableSlots={availableSlots}
                    selectedTime={bookingData.selectedTime}
                    loading={loading}
                    error={error}
                    onTimeSelect={handleTimeSelect}
                    onRetry={handleRetrySlots}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Professional Selection */}
          {currentStep === 4 && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <ProfessionalSelection
                  bookingData={bookingData}
                  availableSlots={availableSlots}
                  selectedProfessional={bookingData.professional}
                  loading={loading}
                  onProfessionalSelect={handleProfessionalSelect}
                  onBackToTime={prevStep}
                />
              </div>
            </div>
          )}

          {/* Step 5: Booking Summary Only */}
          {currentStep === 5 && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-3 flex-shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                  Resumen de tu cita
                </h2>
                <p className="text-gray-600 text-xs">
                  Revisa los detalles antes de continuar
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="w-full max-w-2xl px-2">
                  <BookingSummary bookingData={bookingData} />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Contact Information Only */}
          {currentStep === 6 && (
            <div className="flex flex-col h-full">
              <div className="text-center mb-3 flex-shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                  Información de contacto
                </h2>
                <p className="text-gray-600 text-xs">
                  Completa tus datos para confirmar la reserva
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="w-full max-w-sm">
                  <ContactForm
                    bookingData={bookingData}
                    onUpdateData={updateBookingData}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && <SuccessMessage clientEmail={bookingData.clientEmail} />}
        </div>
      </div>

      {/* Navigation Buttons - Fixed Footer */}
      {!success && (
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm"
              >
                Anterior
              </Button>

              {currentStep < 6 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {loading ? "Creando reserva..." : "Confirmar Reserva"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
