
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Clock, DollarSign} from "lucide-react";
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
    <div className="flex items-center justify-center h-screen px-4">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4 tracking-tight">
            ¿Qué servicio necesitas?
          </h1>
        
        </div>

        <div className="w-full mx-auto">
          <div className="space-y-3">
      
            <Select 
              value={selectedService?.id || ""} 
              onValueChange={handleServiceChange}
            >
              <SelectTrigger className="w-full h-16 px-6 text-left border-2 border-gray-200 hover:border-gray-300 focus:border-gray-900 bg-white shadow-sm rounded-xl transition-all duration-200">
                <span className="text-gray-900 text-lg">
                  {selectedService ? selectedService.name : "Elige tu servicio..."}
                </span>
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
      </div>
    </div>
  );
}
