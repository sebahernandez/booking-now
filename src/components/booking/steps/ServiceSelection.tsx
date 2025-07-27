import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";
import { Service } from "@/types/booking-wizard";
import { formatters } from "@/utils/booking-utils";

interface ServiceSelectionProps {
  services: Service[];
  selectedService?: Service;
  hoveredService: string | null;
  onServiceSelect: (service: Service) => void;
  onServiceHover: (serviceId: string | null) => void;
}

export function ServiceSelection({
  services,
  selectedService,
  hoveredService,
  onServiceSelect,
  onServiceHover,
}: ServiceSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¿Qué servicio necesitas?
        </h2>
        <p className="text-gray-600">Elige el servicio perfecto para ti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              selectedService?.id === service.id
                ? "border-2 border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50"
                : "border border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onServiceSelect(service)}
            onMouseEnter={() => onServiceHover(service.id)}
            onMouseLeave={() => onServiceHover(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    {service.name}
                  </h4>
                  {service.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                {selectedService?.id === service.id && (
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{service.duration} min</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-gray-900">
                    {formatters.currency(service.price)}
                  </div>
                </div>
              </div>

              {hoveredService === service.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                    size="sm"
                  >
                    Seleccionar servicio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
