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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 h-full flex flex-col">
      <div className="flex-shrink-0 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Horarios disponibles
        </h3>
        <p className="text-gray-600 text-xs">{formatters.date(selectedDate)}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-500 text-xs">{messages.loading.availability}</p>
        </div>
      ) : error ? (
        <div className="flex-1">
          <NetworkError error={error} onRetry={onRetry} loading={loading} />
        </div>
      ) : availableSlots.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedTime === slot.time ? "default" : "outline"}
                className={`w-full h-12 font-medium transition-all duration-200 ${
                  selectedTime === slot.time
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md"
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
                onClick={() => onTimeSelect(slot)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-current" />
                    <span className="text-sm">{slot.time}</span>
                  </div>
                  <span className="text-xs opacity-80">
                    {slot.professionals?.length || 0} profesional(es)
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-1 text-sm">No hay horarios disponibles</p>
          <p className="text-xs text-gray-400 mb-3 text-center">
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
      )}
    </div>
  );
}
