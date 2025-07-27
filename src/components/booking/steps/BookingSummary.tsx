import { Clock } from "lucide-react";
import { BookingData } from "@/types/booking-wizard";
import { formatters } from "@/utils/booking-utils";

interface BookingSummaryProps {
  bookingData: BookingData;
}

export function BookingSummary({ bookingData }: BookingSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">
              {bookingData.service?.name}
            </h3>
            <p className="text-blue-100">Resumen de tu cita</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {bookingData.service &&
                formatters.currency(bookingData.service.price)}
            </div>
            <div className="text-blue-100 text-sm">
              {bookingData.service?.duration} minutos
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              FECHA
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {bookingData.selectedDate &&
                formatters.date(bookingData.selectedDate)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">
              HORA
            </label>
            <div className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              {bookingData.selectedTime}
            </div>
          </div>

          {bookingData.professional && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                PROFESIONAL
              </label>
              <div className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
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
              <label className="text-sm font-medium text-gray-500 block mb-1">
                DESCRIPCIÓN
              </label>
              <div className="text-sm text-gray-700">
                {bookingData.service.description}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">
              Total a pagar:
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {bookingData.service &&
                formatters.currency(bookingData.service.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
