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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <div>
        <Label
          htmlFor="clientName"
          className="text-sm font-medium text-gray-700"
        >
          Nombre completo *
        </Label>
        <Input
          id="clientName"
          type="text"
          value={bookingData.clientName || ""}
          onChange={(e) => onUpdateData({ clientName: e.target.value })}
          placeholder={messages.placeholders.name}
          className="mt-1 h-10 text-sm"
          required
        />
      </div>

      <div>
        <Label
          htmlFor="clientEmail"
          className="text-sm font-medium text-gray-700"
        >
          Email *
        </Label>
        <Input
          id="clientEmail"
          type="email"
          value={bookingData.clientEmail || ""}
          onChange={(e) => onUpdateData({ clientEmail: e.target.value })}
          placeholder={messages.placeholders.email}
          className="mt-1 h-10 text-sm"
          required
        />
      </div>

      <div>
        <Label
          htmlFor="clientPhone"
          className="text-sm font-medium text-gray-700"
        >
          Teléfono
        </Label>
        <Input
          id="clientPhone"
          type="tel"
          value={bookingData.clientPhone || ""}
          onChange={(e) => onUpdateData({ clientPhone: e.target.value })}
          placeholder={messages.placeholders.phone}
          className="mt-1 h-10 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notas adicionales
        </Label>
        <Textarea
          id="notes"
          rows={2}
          value={bookingData.notes || ""}
          onChange={(e) => onUpdateData({ notes: e.target.value })}
          placeholder={messages.placeholders.notes}
          className="mt-1 text-sm resize-none"
        />
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <input
            id="acceptedTerms"
            type="checkbox"
            checked={bookingData.acceptedTerms || false}
            onChange={(e) => onUpdateData({ acceptedTerms: e.target.checked })}
            className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <Label
            htmlFor="acceptedTerms"
            className="text-xs text-gray-700 cursor-pointer leading-tight"
          >
            <span className="text-blue-600 hover:text-blue-700 underline">
              Acepto los términos y condiciones del servicio y autorizo el uso
              de mis datos para la reserva *
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
}
