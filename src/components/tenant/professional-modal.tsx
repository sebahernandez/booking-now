"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users, Briefcase } from "lucide-react";

interface Service {
  id: string;
  name: string;
}

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
    service: Service;
  }>;
}

interface TenantProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  professional?: Professional | null;
  services: Service[];
}

export function TenantProfessionalModal({ 
  isOpen, 
  onClose, 
  onSave, 
  professional,
  services 
}: TenantProfessionalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    hourlyRate: 0,
    isAvailable: true,
    serviceIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.user.name,
        email: professional.user.email,
        phone: professional.user.phone || "",
        bio: professional.bio || "",
        hourlyRate: professional.hourlyRate || 0,
        isAvailable: professional.isAvailable,
        serviceIds: professional.services.map(s => s.service.id),
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        bio: "",
        hourlyRate: 0,
        isAvailable: true,
        serviceIds: [],
      });
    }
    setError("");
  }, [professional, isOpen]);

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: checked 
        ? [...prev.serviceIds, serviceId]
        : prev.serviceIds.filter(id => id !== serviceId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = professional
        ? `/api/tenant/professionals/${professional.id}`
        : "/api/tenant/professionals";
      
      const method = professional ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        isAvailable: formData.isAvailable,
        services: formData.serviceIds,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar el profesional");
      }
    } catch (error) {
      console.error("Error saving professional:", error);
      setError("Error al guardar el profesional");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!professional || !confirm("¿Estás seguro de que quieres eliminar este profesional?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tenant/professionals/${professional.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al eliminar el profesional");
      }
    } catch (error) {
      console.error("Error deleting professional:", error);
      setError("Error al eliminar el profesional");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            {professional ? "Editar Profesional" : "Nuevo Profesional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center pb-2 border-b border-gray-100">
              <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center mr-2">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del profesional"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          {/* Información Profesional */}
          <div className="space-y-4">
            <div className="flex items-center pb-2 border-b border-gray-100">
              <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center mr-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Información Profesional</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe la experiencia y especialidades"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
              />
              <Label htmlFor="isAvailable">Disponible para reservas</Label>
            </div>
          </div>

          {/* Servicios */}
          {services.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center pb-2 border-b border-gray-100">
                <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center mr-2">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Servicios que puede brindar</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {professional && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Eliminar
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : professional ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}