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
    <div className="h-full flex flex-col space-y-4">
      <div className="text-center flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Selecciona un profesional
        </h2>
        <p className="text-gray-600 text-sm">
          Elige el profesional que prefieras para tu cita
        </p>
      </div>

      <div className="flex-1 w-full mx-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex-shrink-0">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Tu selección actual:
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
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
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-500 text-sm">{messages.loading.professionals}</p>
            </div>
          ) : availableProfessionals.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm flex-shrink-0">
                Profesionales disponibles para {bookingData.selectedTime}:
              </h4>
              <div className="flex-1 overflow-y-auto space-y-2">
                {availableProfessionals.map((professional) => (
                  <Button
                    key={professional.id}
                    variant={
                      selectedProfessional?.id === professional.id
                        ? "default"
                        : "outline"
                    }
                    className={`w-full h-14 justify-start font-medium transition-all duration-200 ${
                      selectedProfessional?.id === professional.id
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md"
                        : "hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    onClick={() => onProfessionalSelect(professional)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {professional.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">
                          {professional.user.name}
                        </div>
                        <div className="text-xs opacity-80">
                          Profesional especializado
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-3 text-sm text-center">
                {availableSlots.length === 0
                  ? "Debes seleccionar un horario primero"
                  : "No hay profesionales disponibles para este horario"}
              </p>
              <Button variant="outline" onClick={onBackToTime} size="sm">
                Volver a seleccionar horario
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
