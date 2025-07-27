import { CheckCircle } from "lucide-react";
import { messages } from "@/utils/booking-utils";

interface SuccessMessageProps {
  clientEmail?: string;
}

export function SuccessMessage({ clientEmail }: SuccessMessageProps) {
  return (
    <div className="text-center py-12">
      <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
      <h2 className="text-4xl font-bold text-green-800 mb-4">
        {messages.success.bookingCreated}
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        {messages.success.bookingDescription}
      </p>
      {clientEmail && (
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-green-800">
            {messages.success.emailConfirmation} <strong>{clientEmail}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
