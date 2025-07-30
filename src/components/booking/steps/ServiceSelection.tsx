import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Star, DollarSign, Check, ChevronDown } from "lucide-react";
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
  onServiceSelect,
}: ServiceSelectionProps) {
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      onServiceSelect(service);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4 tracking-tight">
          ¿Qué servicio necesitas?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Selecciona el servicio perfecto para ti
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            Selecciona un servicio
          </label>
          <Select 
            value={selectedService?.id || ""} 
            onValueChange={handleServiceChange}
          >
            <SelectTrigger className="w-full h-16 px-6 text-left border-2 border-gray-200 hover:border-gray-300 focus:border-gray-900 bg-white shadow-sm rounded-xl transition-all duration-200">
              <div className="flex items-center justify-between w-full">
                <SelectValue 
                  placeholder="Elige tu servicio..." 
                  className="text-gray-500 text-lg"
                />
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-xl border-2 border-gray-100 shadow-lg">
              {services.map((service) => (
                <SelectItem 
                  key={service.id} 
                  value={service.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-lg mx-2 my-1"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-base mb-1">
                        {service.name}
                      </div>
                      {service.description && (
                        <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {service.description}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">{service.duration} min</span>
                        </div>
                        <div className="flex items-center text-gray-900">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">
                            {formatters.currency(service.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedService && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Check className="w-4 h-4" />
                Servicio seleccionado
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedService.name}
              </h3>
              {selectedService.description && (
                <p className="text-gray-600 text-base leading-relaxed">
                  {selectedService.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-1">Duración</div>
                <div className="text-xl font-semibold text-gray-900">
                  {selectedService.duration} min
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-1">Precio</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatters.currency(selectedService.price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
