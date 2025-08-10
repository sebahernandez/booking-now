
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
              <SelectTrigger className="w-full h-14 sm:h-16 px-4 sm:px-6 text-left border-2 border-border hover:border-border/80 focus:border-primary bg-background shadow-sm rounded-xl transition-all duration-200">
                <span className="text-foreground text-base sm:text-lg truncate">
                  {selectedService ? selectedService.name : "Elige tu servicio..."}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-80 rounded-xl border-2 border-border shadow-lg w-full">
                {services.map((service) => (
                  <SelectItem 
                    key={service.id} 
                    value={service.id}
                    className="p-3 sm:p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 rounded-lg mx-1 sm:mx-2 my-1 transition-colors duration-200 ease-in-out"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm sm:text-base mb-1 truncate">
                          {service.name}
                        </div>
                        {service.description && (
                          <div className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2 break-words">
                            {service.description}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm whitespace-nowrap">{service.duration} min</span>
                          </div>
                          <div className="flex items-center text-foreground">
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
