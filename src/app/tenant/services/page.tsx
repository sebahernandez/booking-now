"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { TenantServiceModal } from "@/components/tenant/service-modal";
import { ServiceAvailabilityModal } from "@/components/tenant/service-availability-modal";
import { useToast } from "@/hooks/useToast";
import { ServicesLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
  _count?: {
    bookings: number;
  };
  availabilitySchedule?: ServiceAvailability[];
}

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getScheduleSummary = (availabilitySchedule?: ServiceAvailability[]) => {
  if (!availabilitySchedule || availabilitySchedule.length === 0) {
    return "Disponible 24/7";
  }

  const groupedByDay = availabilitySchedule.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) acc[schedule.dayOfWeek] = [];
    acc[schedule.dayOfWeek].push(`${schedule.startTime}-${schedule.endTime}`);
    return acc;
  }, {} as Record<number, string[]>);

  const daysSummary = Object.keys(groupedByDay)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(
      (day) =>
        `${DAYS_OF_WEEK[parseInt(day)]}: ${groupedByDay[parseInt(day)].join(
          ", "
        )}`
    )
    .join(" • ");

  return daysSummary || "Sin horarios configurados";
};

export default function TenantServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedServiceForSchedule, setSelectedServiceForSchedule] = useState<Service | null>(null);
  
  // Estados para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { showSuccess, showError, showWarning, showLoading, updateToast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (showToast = false) => {
    let toastId;
    if (showToast) {
      toastId = showLoading("Actualizando servicios...");
    }

    try {
      const response = await fetch("/api/tenant/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
        if (showToast && toastId) {
          updateToast(toastId, "success", `${data.length} servicios cargados`);
        }
      } else {
        if (showToast && toastId) {
          updateToast(toastId, "error", "Error al cargar servicios");
        }
        showError("Error al cargar los servicios");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      if (showToast && toastId) {
        updateToast(toastId, "error", "Error de conexión");
      }
      showError("Error de conexión al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    setSelectedService(service || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };

  const handleSaveService = () => {
    fetchServices(true); // Refresh con toast
    handleCloseModal();
  };

  const handleDeleteService = async (serviceId: string) => {
    showWarning("¿Confirmar eliminación del servicio?");
    
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    const toastId = showLoading("Eliminando servicio...");

    try {
      const response = await fetch(`/api/tenant/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        updateToast(toastId, "success", "Servicio eliminado exitosamente");
        await fetchServices();
      } else {
        const error = await response.json();
        updateToast(toastId, "error", error.error || "Error al eliminar el servicio");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      updateToast(toastId, "error", "Error de conexión al eliminar servicio");
    }
  };

  const handleOpenScheduleModal = (service: Service) => {
    setSelectedServiceForSchedule(service);
    setIsAvailabilityModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsAvailabilityModalOpen(false);
    setSelectedServiceForSchedule(null);
  };

  const handleSaveSchedule = () => {
    // Refrescar los servicios para mostrar la disponibilidad actualizada
    showSuccess("Horarios del servicio actualizados");
    fetchServices(true);
    handleCloseScheduleModal();
  };

  // Funciones de filtrado y paginación
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.price.toString().includes(searchTerm) ||
    service.duration.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  // Reset página cuando cambia el filtro
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (loading) {
    return <ServicesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Servicios</h1>
          <p className="text-gray-600">
            Gestiona los servicios que ofreces a tus clientes
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Mis Servicios</CardTitle>
              <CardDescription>
                {filteredServices.length} de {services.length} servicio{services.length !== 1 ? 's' : ''} 
                {searchTerm && ` (filtrado por "${searchTerm}")`}
              </CardDescription>
            </div>
            
            {/* Controles de búsqueda y paginación */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Reservas</TableHead>
                <TableHead>Horarios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {service.name}
                      </div>
                      {service.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center font-medium text-green-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {service.price.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      })}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      variant={service.isActive ? "default" : "secondary"}
                      className={
                        service.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {service.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {service._count?.bookings || 0} reservas
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-[200px] truncate">
                      {getScheduleSummary(service.availabilitySchedule)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(service)}
                        title="Editar servicio"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenScheduleModal(service)}
                        title="Configurar horarios"
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        title="Eliminar servicio"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          {filteredServices.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredServices.length)} de {filteredServices.length} resultados
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes servicios aún
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Comienza agregando tu primer servicio para que los clientes puedan
              reservar
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer servicio
            </Button>
          </CardContent>
        </Card>
      )}

      <TenantServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        service={selectedService}
      />

      <ServiceAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={handleCloseScheduleModal}
        onSave={handleSaveSchedule}
        service={selectedServiceForSchedule}
      />
    </div>
  );
}
