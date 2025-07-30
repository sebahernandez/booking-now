import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { AvailableSlot } from "@/types/booking-wizard";
import { formatters, messages } from "@/utils/booking-utils";
import { NetworkError } from "../NetworkError";

interface TimeSelectionProps {
  selectedDate: string;
  availableSlots: AvailableSlot[];
  selectedTime?: string;
  loading: boolean;
  error?: string;
  onTimeSelect: (slot: AvailableSlot) => void;
  onRetry?: () => void;
  tenantId?: string;
  serviceId?: string;
  serviceName?: string;
}

export function TimeSelection({
  selectedDate,
  availableSlots,
  selectedTime,
  loading,
  error,
  onTimeSelect,
  onRetry,
}: TimeSelectionProps) {
  if (!selectedDate) {
    return (
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 mb-2">Selecciona una fecha</p>
        <p className="text-sm text-gray-400">
          Los horarios disponibles aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Horarios disponibles
      </h3>
      <p className="text-gray-600 mb-6">{formatters.date(selectedDate)}</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">{messages.loading.availability}</p>
        </div>
      ) : error ? (
        <NetworkError error={error} onRetry={onRetry} loading={loading} />
      ) : availableSlots.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {availableSlots.map((slot, index) => (
            <Button
              key={index}
              variant={selectedTime === slot.time ? "default" : "outline"}
              className={`w-full h-16 font-medium transition-all duration-200 ${
                selectedTime === slot.time
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-md"
                  : "hover:bg-blue-50 hover:border-blue-300"
              }`}
              onClick={() => onTimeSelect(slot)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-current" />
                  <span className="text-lg">{slot.time}</span>
                </div>
                <span className="text-sm opacity-80">
                  {slot.professionals?.length || 0} profesional(es)
                  disponible(s)
                </span>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No hay horarios disponibles</p>
            <p className="text-sm text-gray-400 mb-4">
              Selecciona otra fecha o verifica la configuración del servicio
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-xs"
              >
                Reintentar carga
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
