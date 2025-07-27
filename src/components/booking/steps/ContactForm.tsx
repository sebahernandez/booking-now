import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookingData } from "@/types/booking-wizard";
import { messages } from "@/utils/booking-utils";

interface ContactFormProps {
  bookingData: BookingData;
  onUpdateData: (data: Partial<BookingData>) => void;
}

export function ContactForm({ bookingData, onUpdateData }: ContactFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
      <div>
        <Label
          htmlFor="clientName"
          className="text-base font-medium text-gray-700"
        >
          Nombre completo *
        </Label>
        <Input
          id="clientName"
          type="text"
          value={bookingData.clientName || ""}
          onChange={(e) => onUpdateData({ clientName: e.target.value.trim() })}
          placeholder={messages.placeholders.name}
          className="mt-2 h-12 text-base"
          required
        />
      </div>

      <div>
        <Label
          htmlFor="clientEmail"
          className="text-base font-medium text-gray-700"
        >
          Email *
        </Label>
        <Input
          id="clientEmail"
          type="email"
          value={bookingData.clientEmail || ""}
          onChange={(e) =>
            onUpdateData({
              clientEmail: e.target.value.trim(),
            })
          }
          placeholder={messages.placeholders.email}
          className="mt-2 h-12 text-base"
          required
        />
      </div>

      <div>
        <Label
          htmlFor="clientPhone"
          className="text-base font-medium text-gray-700"
        >
          Teléfono
        </Label>
        <Input
          id="clientPhone"
          type="tel"
          value={bookingData.clientPhone || ""}
          onChange={(e) => onUpdateData({ clientPhone: e.target.value })}
          placeholder={messages.placeholders.phone}
          className="mt-2 h-12 text-base"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-base font-medium text-gray-700">
          Notas adicionales
        </Label>
        <Textarea
          id="notes"
          rows={4}
          value={bookingData.notes || ""}
          onChange={(e) => onUpdateData({ notes: e.target.value })}
          placeholder={messages.placeholders.notes}
          className="mt-2 text-base"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <input
            id="acceptedTerms"
            type="checkbox"
            checked={bookingData.acceptedTerms || false}
            onChange={(e) => onUpdateData({ acceptedTerms: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <Label
            htmlFor="acceptedTerms"
            className="text-sm text-gray-700 cursor-pointer"
          >
            Acepto los{" "}
            <span className="text-blue-600 hover:text-blue-700 underline">
              términos y condiciones
            </span>{" "}
            del servicio y autorizo el uso de mis datos para la reserva *
          </Label>
        </div>
      </div>
    </div>
  );
}
