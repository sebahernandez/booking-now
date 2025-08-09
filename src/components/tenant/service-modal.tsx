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
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  DollarSign,
  FileText,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface TenantServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service?: Service | null;
}

export function TenantServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
}: TenantServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        duration: service.duration.toString() || "",
        price: service.price.toString() || "",
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        duration: "",
        price: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [service, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del servicio es requerido";
    }

    if (
      !formData.duration ||
      isNaN(Number(formData.duration)) ||
      Number(formData.duration) <= 0
    ) {
      newErrors.duration = "La duracion debe ser un numero mayor a 0";
    }

    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price = "El precio debe ser un numero mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.showError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    const isEdit = !!service;
    const toastId = toast.showLoading(
      isEdit ? "Actualizando servicio..." : "Creando servicio..."
    );

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        duration: Number(formData.duration),
        price: Number(formData.price),
        isActive: formData.isActive,
      };

      const url = service
        ? `/api/tenant/services/${service.id}`
        : "/api/tenant/services";

      const method = service ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.updateToast(
          toastId,
          "success",
          isEdit
            ? "Servicio actualizado exitosamente"
            : "Servicio creado exitosamente"
        );
        onSave();
      } else {
        const errorData = await response.json();
        toast.updateToast(
          toastId,
          "error",
          errorData.error || "Error al guardar el servicio"
        );
        setErrors({
          submit: errorData.error || "Error al guardar el servicio",
        });
      }
    } catch {
      toast.updateToast(toastId, "error", "Error de conexión");
      setErrors({ submit: "Error de conexion" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="name" className="block pb-2 font-medium">
                  Nombre del servicio *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Corte de cabello"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="block pb-2 font-medium">
                  Descripcion
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe el servicio que ofreces..."
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <Label htmlFor="duration" className="font-medium">
                      Duracion (minutos) *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56" side="top">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">
                            Referencia de tiempo:
                          </h4>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>1 hora:</span>
                              <span>60 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>1.5 horas:</span>
                              <span>90 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2 horas:</span>
                              <span>120 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2.5 horas:</span>
                              <span>150 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>3 horas:</span>
                              <span>180 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>4 horas:</span>
                              <span>240 min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>5 horas:</span>
                              <span>300 min</span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="60"
                      className={`pl-10 ${errors.duration ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price" className="block pb-2 font-medium">
                    Precio (CLP) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="25000"
                      className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : service ? "Actualizar" : "Crear"}{" "}
              Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
