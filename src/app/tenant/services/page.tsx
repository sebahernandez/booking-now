"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, DollarSign, Edit, Trash2, Calendar } from "lucide-react";
import { TenantServiceModal } from "@/components/tenant/service-modal";
import { ServiceAvailabilityModal } from "@/components/tenant/service-availability-modal";

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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/tenant/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
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
    fetchServices();
    handleCloseModal();
  };

  const handleDeleteService = async (serviceId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/tenant/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchServices();
      } else {
        const error = await response.json();
        alert(error.error || "Error al eliminar el servicio");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Error al eliminar el servicio");
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
    // Los horarios se guardan automáticamente en el modal
    handleCloseScheduleModal();
  };

  if (loading) {
    return <div>Cargando servicios...</div>;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900">
                    {service.name}
                  </CardTitle>
                  {service.description && (
                    <CardDescription className="mt-1 text-gray-600">
                      {service.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-gray-700">
                      {service.duration} minutos
                    </span>
                  </div>
                  <div className="flex items-center font-semibold">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-gray-900">
                      {service.price.toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {service._count?.bookings || 0} reservas realizadas
                </div>

                <div className="text-sm text-gray-500 border-t pt-2">
                  <div className="flex items-start gap-1">
                    <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-tight">
                      {getScheduleSummary(service.availabilitySchedule)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-50"
                    onClick={() => handleOpenModal(service)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    onClick={() => handleOpenScheduleModal(service)}
                    title="Configurar horarios"
                  >
                    <Calendar className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={() => handleDeleteService(service.id)}
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
