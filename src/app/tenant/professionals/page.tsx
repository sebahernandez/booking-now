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
  Mail,
  Phone,
  User,
  Briefcase,
  Edit,
  Calendar,
  Star,
  Users,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TenantProfessionalModal } from "@/components/tenant/professional-modal";
import { useToast } from "@/hooks/useToast";
import { ProfessionalsLoadingSkeleton } from "@/components/ui/loading-skeleton";

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
  
  // Estados para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { showSuccess, showError, showLoading, updateToast } = useToast();

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);

  const fetchProfessionals = async (showToast = false) => {
    let toastId;
    if (showToast) {
      toastId = showLoading("Actualizando profesionales...");
    }

    try {
      const response = await fetch("/api/tenant/professionals");
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
        if (showToast && toastId) {
          updateToast(toastId, "success", `${data.length} profesionales cargados`);
        }
      } else {
        if (showToast && toastId) {
          updateToast(toastId, "error", "Error al cargar profesionales");
        }
        showError("Error al cargar profesionales");
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
      if (showToast && toastId) {
        updateToast(toastId, "error", "Error de conexión");
      }
      showError("Error de conexión al cargar profesionales");
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
      } else {
        showError("Error al cargar servicios disponibles");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Error de conexión al cargar servicios");
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
    fetchProfessionals(true); // Refresh con toast
    handleCloseModal();
  };

  // Funciones de filtrado y paginación
  const filteredProfessionals = professionals.filter((professional) =>
    professional.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.services.some(service => 
      service.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredProfessionals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfessionals = filteredProfessionals.slice(startIndex, endIndex);

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
    return <ProfessionalsLoadingSkeleton />;
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Equipo de Profesionales</CardTitle>
              <CardDescription>
                {filteredProfessionals.length} de {professionals.length} profesional{professionals.length !== 1 ? 'es' : ''} 
                {searchTerm && ` (filtrado por "${searchTerm}")`}
              </CardDescription>
            </div>
            
            {/* Controles de búsqueda y paginación */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar profesionales..."
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
                <TableHead>Profesional</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Tarifa/Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Reservas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProfessionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {professional.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {professional.user.name}
                        </div>
                        {professional.bio && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {professional.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-[150px]">{professional.user.email}</span>
                      </div>
                      {professional.user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          <span>{professional.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {professional.services.slice(0, 2).map((service) => (
                        <Badge
                          key={service.service.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {service.service.name}
                        </Badge>
                      ))}
                      {professional.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {professional.hourlyRate && professional.hourlyRate > 0 ? (
                      <div className="font-medium text-green-600">
                        {new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          minimumFractionDigits: 0,
                        }).format(professional.hourlyRate)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No configurada</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      variant={professional.isAvailable ? "default" : "secondary"}
                      className={
                        professional.isAvailable
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {professional.isAvailable ? "Disponible" : "No disponible"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {professional._count?.bookings || 0}
                      </span>
                      <Star className="w-3 h-3 text-yellow-500 ml-2" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(professional)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          {filteredProfessionals.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProfessionals.length)} de {filteredProfessionals.length} resultados
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

      {professionals.length === 0 && !searchTerm && (
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

      {/* Estado cuando no hay resultados de búsqueda */}
      {professionals.length > 0 && filteredProfessionals.length === 0 && searchTerm && (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md leading-relaxed">
              No hay profesionales que coincidan con tu búsqueda &quot;{searchTerm}&quot;. 
              Intenta con otros términos o limpia el filtro.
            </p>
            <Button
              variant="outline"
              onClick={() => handleSearchChange("")}
            >
              Limpiar búsqueda
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
