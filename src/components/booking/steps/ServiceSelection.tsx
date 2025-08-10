
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
    <div className="flex items-start justify-center min-h-screen px-2 sm:px-4 py-8 sm:py-24">
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        <div className="w-full mx-auto">
          <div className="space-y-3">
            <Select 
              value={selectedService?.id || ""} 
              onValueChange={handleServiceChange}
            >
              <SelectTrigger className="w-full h-14 sm:h-16 px-4 sm:px-6 text-left border-2 border-gray-200 hover:border-gray-300 focus:border-gray-900 bg-white shadow-sm rounded-xl transition-all duration-200">
                <span className="text-gray-900 dark:text-white text-base sm:text-lg truncate">
                  {selectedService ? selectedService.name : "Elige tu servicio..."}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-80 rounded-xl border-2 border-gray-100 shadow-lg w-full">
                {services.map((service) => (
                  <SelectItem 
                    key={service.id} 
                    value={service.id}
                    className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-lg mx-1 sm:mx-2 my-1"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 truncate">
                          {service.name}
                        </div>
                        {service.description && (
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 break-words">
                            {service.description}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm whitespace-nowrap">{service.duration} min</span>
                          </div>
                          <div className="flex items-center text-gray-900 dark:text-white">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
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
