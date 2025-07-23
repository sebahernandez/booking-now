"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, User, Briefcase, Edit } from "lucide-react";
import { TenantProfessionalModal } from "@/components/tenant/professional-modal";

interface Professional {
  id: string;
  bio?: string;
  hourlyRate?: number;
  isAvailable: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
  services: Array<{
    service: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    bookings: number;
  };
}

interface Service {
  id: string;
  name: string;
}

export default function TenantProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/tenant/professionals");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/tenant/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleOpenModal = (professional?: Professional) => {
    setSelectedProfessional(professional || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProfessional(null);
    setIsModalOpen(false);
  };

  const handleSaveProfessional = () => {
    fetchProfessionals();
    handleCloseModal();
  };

  if (loading) {
    return <div>Cargando profesionales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mis Profesionales
          </h1>
          <p className="text-gray-600">
            Administra el equipo de profesionales que brindan tus servicios
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Profesional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {professional.user.name}
                    </CardTitle>
                    <CardDescription>
                      {professional.services.length} servicios
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={professional.isAvailable ? "default" : "secondary"}
                >
                  {professional.isAvailable ? "Disponible" : "No disponible"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {professional.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {professional.bio}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {professional.user.email}
                  </div>

                  {professional.user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {professional.user.phone}
                    </div>
                  )}

                  {professional.hourlyRate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />$
                      {professional.hourlyRate.toLocaleString("es-CL")}/hora
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {professional._count?.bookings || 0} reservas atendidas
                </div>

                {/* Servicios */}
                <div>
                  <p className="text-sm font-medium mb-2">Servicios:</p>
                  <div className="flex flex-wrap gap-1">
                    {professional.services.map((service) => (
                      <Badge
                        key={service.service.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {service.service.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenModal(professional)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes profesionales aún
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Agrega profesionales a tu equipo para que puedan brindar servicios
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer profesional
            </Button>
          </CardContent>
        </Card>
      )}

      <TenantProfessionalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProfessional}
        professional={selectedProfessional}
        services={services}
      />
    </div>
  );
}
