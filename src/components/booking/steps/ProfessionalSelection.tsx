import { Button } from "@/components/ui/button";
import {
  Professional,
  AvailableSlot,
  BookingData,
} from "@/types/booking-wizard";
import { formatters, messages } from "@/utils/booking-utils";

interface ProfessionalSelectionProps {
  bookingData: BookingData;
  availableSlots: AvailableSlot[];
  selectedProfessional?: Professional;
  loading: boolean;
  onProfessionalSelect: (professional: Professional) => void;
  onBackToTime: () => void;
}

export function ProfessionalSelection({
  bookingData,
  availableSlots,
  selectedProfessional,
  loading,
  onProfessionalSelect,
  onBackToTime,
}: ProfessionalSelectionProps) {
  const availableProfessionals =
    availableSlots.find((slot) => slot.time === bookingData.selectedTime)
      ?.professionals || [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Selecciona un profesional
        </h2>
        <p className="text-gray-600">
          Elige el profesional que prefieras para tu cita
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Tu selección actual:
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Servicio:</strong> {bookingData.service?.name}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {bookingData.selectedDate &&
                  formatters.date(bookingData.selectedDate)}
              </p>
              <p>
                <strong>Hora:</strong> {bookingData.selectedTime}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">{messages.loading.professionals}</p>
            </div>
          ) : availableProfessionals.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Profesionales disponibles para {bookingData.selectedTime}:
              </h4>
              <div className="space-y-3">
                {availableProfessionals.map((professional) => (
                  <Button
                    key={professional.id}
                    variant={
                      selectedProfessional?.id === professional.id
                        ? "default"
                        : "outline"
                    }
                    className={`w-full h-16 justify-start font-medium transition-all duration-200 ${
                      selectedProfessional?.id === professional.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md"
                        : "hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    onClick={() => onProfessionalSelect(professional)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg font-medium text-gray-600">
                          {professional.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold">
                          {professional.user.name}
                        </div>
                        <div className="text-sm opacity-80">
                          Profesional especializado
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {availableSlots.length === 0
                  ? "Debes seleccionar un horario primero"
                  : "No hay profesionales disponibles para este horario"}
              </p>
              <Button variant="outline" onClick={onBackToTime}>
                Volver a seleccionar horario
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
