"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Users, Calendar, MoreHorizontal } from "lucide-react";
import { TenantModal } from "@/components/admin/tenant-modal";
import { useToast } from "@/hooks/useToast";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
    professionals: number;
    services: number;
    bookings: number;
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const toast = useToast();

  const fetchTenants = useCallback(async (showToast = false) => {
    let toastId;
    if (showToast) {
      toastId = toast.showLoading("Actualizando lista de clientes...");
    }
    
    try {
      const response = await fetch("/api/admin/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
        if (showToast && toastId) {
          toast.updateToast(toastId, "success", `${data.length} clientes cargados exitosamente`);
        }
      } else {
        if (showToast && toastId) {
          toast.updateToast(toastId, "error", "Error al cargar los clientes");
        }
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      if (showToast && toastId) {
        toast.updateToast(toastId, "error", "Error de conexión al cargar clientes");
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOpenModal = (tenant?: Tenant) => {
    setSelectedTenant(tenant || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTenant(null);
    setIsModalOpen(false);
  };

  const handleSaveTenant = () => {
    fetchTenants(true); // Refresh con toast
    handleCloseModal();
  };

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600">
            Administra los clientes que pueden usar la plataforma
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.email}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(tenant)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              {tenant.phone && (
                <p className="text-sm text-gray-600">{tenant.phone}</p>
              )}
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    tenant.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tenant.isActive ? "Activo" : "Inactivo"}
                </span>
                <span className="text-xs text-gray-500">
                  Desde {new Date(tenant.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{tenant._count?.users || 0} usuarios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{tenant._count?.professionals || 0} profesionales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{tenant._count?.services || 0} servicios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{tenant._count?.bookings || 0} reservas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clientes registrados
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Comienza agregando tu primer cliente para que puedan usar la
              plataforma
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer cliente
            </Button>
          </CardContent>
        </Card>
      )}

      <TenantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTenant}
        tenant={selectedTenant}
      />
    </div>
  );
}
