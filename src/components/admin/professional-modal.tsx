"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Professional {
  id: string;
  bio?: string;
  hourlyRate?: number;
  isAvailable: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  services: Array<{
    service: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

interface Service {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface ProfessionalModalProps {
  open: boolean;
  onClose: () => void;
  professional?: Professional | null;
  onSaved: () => void;
}

export default function ProfessionalModal({
  open,
  onClose,
  professional,
  onSaved,
}: ProfessionalModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    password: "",
    bio: "",
    hourlyRate: "",
    isAvailable: true,
    serviceIds: [] as string[],
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  useEffect(() => {
    if (professional) {
      setFormData({
        email: professional.user.email,
        name: professional.user.name || "",
        phone: professional.user.phone || "",
        password: "",
        bio: professional.bio || "",
        hourlyRate: professional.hourlyRate?.toString() || "",
        isAvailable: professional.isAvailable,
        serviceIds: professional.services.map((s) => s.service.id),
      });
    } else {
      setFormData({
        email: "",
        name: "",
        phone: "",
        password: "",
        bio: "",
        hourlyRate: "",
        isAvailable: true,
        serviceIds: [],
      });
    }
    setErrors({});
  }, [professional, open]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();
        setServices(
          Array.isArray(data)
            ? data.filter((service: Service) => service.isActive)
            : []
        );
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: checked
        ? [...prev.serviceIds, serviceId]
        : prev.serviceIds.filter((id) => id !== serviceId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : undefined,
      };

      const url = professional
        ? `/api/admin/professionals/${professional.id}`
        : "/api/admin/professionals";

      const method = professional ? "PUT" : "POST";

      // For editing, don't include email and password
      if (professional) {
        const mutableSubmitData = submitData as Record<string, unknown>;
        delete mutableSubmitData.email;
        delete mutableSubmitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSaved();
        onClose();
      } else {
        const error = await response.json();
        if (error.details) {
          const fieldErrors: Record<string, string> = {};
          error.details.forEach(
            (detail: { path?: string[]; message: string }) => {
              if (detail.path) {
                fieldErrors[detail.path[0]] = detail.message;
              }
            }
          );
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: error.error || "Error al guardar el profesional",
          });
        }
      }
    } catch (error) {
      console.error("Error saving professional:", error);
      setErrors({ general: "Error al guardar el profesional" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {professional ? "Editar Profesional" : "Nuevo Profesional"}
          </DialogTitle>
          <DialogDescription>
            {professional
              ? "Modifica los datos del profesional"
              : "Registra un nuevo profesional en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="text-red-600 text-sm">{errors.general}</div>
          )}

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Personal</h3>

            {!professional && (
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="profesional@ejemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <div className="text-red-600 text-xs mt-1">
                    {errors.email}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre completo"
                className={errors.name ? "border-red-500" : ""}
                required
              />
              {errors.name && (
                <div className="text-red-600 text-xs mt-1">{errors.name}</div>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1234567890"
              />
            </div>

            {!professional && (
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                {errors.password && (
                  <div className="text-red-600 text-xs mt-1">
                    {errors.password}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Profesional</h3>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Describe la experiencia y especialidades..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRate: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
              />
              <Label htmlFor="isAvailable">Disponible para reservas</Label>
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Servicios</h3>
              <p className="text-sm text-gray-600">
                Selecciona los servicios que puede ofrecer este profesional
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onCheckedChange={(checked) =>
                        handleServiceToggle(service.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`service-${service.id}`}
                      className="text-sm flex-1"
                    >
                      {service.name} (${service.price})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : professional ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
