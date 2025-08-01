import { Clock } from "lucide-react";
import { BookingData } from "@/types/booking-wizard";
import { formatters } from "@/utils/booking-utils";

interface BookingSummaryProps {
  bookingData: BookingData;
}

export function BookingSummary({ bookingData }: BookingSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 overflow-hidden">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-0.5">
              {bookingData.service?.name}
            </h3>
            <p className="text-blue-100 text-xs">Resumen de tu cita</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">
              {bookingData.service &&
                formatters.currency(bookingData.service.price)}
            </div>
            <div className="text-blue-100 text-xs">
              {bookingData.service?.duration} min
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Fecha y Hora */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                FECHA
              </label>
              <div className="text-sm font-semibold text-gray-900">
                {bookingData.selectedDate &&
                  formatters.date(bookingData.selectedDate)}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                HORA
              </label>
              <div className="text-sm font-semibold text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                {bookingData.selectedTime}
              </div>
            </div>
          </div>

          {/* Profesional y Descripción */}
          <div className="space-y-3">
            {bookingData.professional && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  PROFESIONAL
                </label>
                <div className="text-sm font-semibold text-gray-900 flex items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center mr-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      {bookingData.professional.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {bookingData.professional.user.name}
                </div>
              </div>
            )}

            {bookingData.service?.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  DESCRIPCIÓN
                </label>
                <div className="text-xs text-gray-700 line-clamp-2">
                  {bookingData.service.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3 mt-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-700">
              Total a pagar:
            </span>
            <span className="text-lg font-bold text-gray-900">
              {bookingData.service &&
                formatters.currency(bookingData.service.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
