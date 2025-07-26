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
import {
  Plus,
  Mail,
  Phone,
  User,
  Briefcase,
  Edit,
  Calendar,
  Star,
  Users,
} from "lucide-react";
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
          <Card
            key={professional.id}
            className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        professional.isAvailable
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-1">
                      {professional.user.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {professional.services.length} servicio
                      {professional.services.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={professional.isAvailable ? "default" : "secondary"}
                  className={`px-3 py-1 text-xs font-medium ${
                    professional.isAvailable
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {professional.isAvailable ? "Disponible" : "No disponible"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {professional.bio && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {professional.bio}
                    </p>
                  </div>
                )}

                {/* Información de contacto */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="truncate">{professional.user.email}</span>
                  </div>

                  {professional.user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <span>{professional.user.phone}</span>
                    </div>
                  )}

                  {professional.hourlyRate && professional.hourlyRate > 0 ? (
                    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3 shadow-sm">
                          <Briefcase className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                            Tarifa por hora
                          </p>
                          <p className="text-lg font-bold text-emerald-800">
                            {new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                              minimumFractionDigits: 0,
                            }).format(professional.hourlyRate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <span className="text-xs font-semibold">
                            Por hora
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 shadow-sm">
                          <Briefcase className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Tarifa por hora
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            No configurada
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          <span className="text-xs font-medium">
                            Sin tarifa
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {professional._count?.bookings || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          reservas completadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">
                        4.8
                      </span>
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                {professional.services.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      Especialidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {professional.services.map((service) => (
                        <Badge
                          key={service.service.id}
                          variant="outline"
                          className="text-xs font-normal px-2 py-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          {service.service.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                    onClick={() => handleOpenModal(professional)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tu equipo está vacío
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md leading-relaxed">
              Comienza agregando profesionales a tu equipo. Ellos podrán brindar
              los servicios que ofreces y gestionar sus propias reservas.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
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
