'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, User, Mail, Phone, DollarSign, FileText, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

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
}

interface Service {
  id: string;
  name: string;
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
  services,
}: TenantProfessionalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    hourlyRate: '',
    isAvailable: true,
    selectedServices: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.user.name || '',
        email: professional.user.email || '',
        phone: professional.user.phone || '',
        bio: professional.bio || '',
        hourlyRate: professional.hourlyRate?.toString() || '',
        isAvailable: professional.isAvailable,
        selectedServices: professional.services.map(s => s.service.id),
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        hourlyRate: '',
        isAvailable: true,
        selectedServices: [],
      });
    }
    setErrors({});
  }, [professional, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.hourlyRate && isNaN(Number(formData.hourlyRate))) {
      newErrors.hourlyRate = 'La tarifa debe ser un número válido';
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
    const isEdit = !!professional;
    const toastId = toast.showLoading(isEdit ? "Actualizando profesional..." : "Creando profesional...");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        bio: formData.bio || null,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
        isAvailable: formData.isAvailable,
        services: formData.selectedServices,
      };

      const url = professional 
        ? `/api/tenant/professionals/${professional.id}`
        : '/api/tenant/professionals';
        
      const method = professional ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.updateToast(toastId, "success", isEdit ? "Profesional actualizado exitosamente" : "Profesional creado exitosamente");
        onSave();
      } else {
        const errorData = await response.json();
        toast.updateToast(toastId, "error", errorData.error || "Error al guardar el profesional");
        setErrors({ submit: errorData.error || 'Error al guardar el profesional' });
      }
    } catch {
      toast.updateToast(toastId, "error", "Error de conexión");
      setErrors({ submit: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {professional ? 'Editar Profesional' : 'Nuevo Profesional'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-2 block">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del profesional"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 block">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@ejemplo.com"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 block">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+56 9 1234 5678"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hourlyRate" className="mb-2 block">Tarifa por hora (CLP)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="50000"
                      className={`pl-10 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="mb-2 block">Biografía profesional</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Describe la experiencia y especialidades del profesional..."
                    className="pl-10 min-h-[100px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="isAvailable" className="mb-2 block">Estado</Label>
                <Select
                  value={formData.isAvailable.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isAvailable: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Disponible</SelectItem>
                    <SelectItem value="false">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Servicios que puede realizar
              </h3>
              
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{service.name}</span>
                        {formData.selectedServices.includes(service.id) && (
                          <Badge variant="default" className="bg-blue-600">
                            Seleccionado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay servicios disponibles</p>
                  <p className="text-sm">Primero debes crear servicios para asignar a los profesionales</p>
                </div>
              )}

              {formData.selectedServices.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Servicios seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedServices.map((serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <Badge key={serviceId} variant="outline" className="flex items-center gap-1">
                          {service.name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleServiceToggle(serviceId)}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
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
              {loading ? 'Guardando...' : (professional ? 'Actualizar' : 'Crear')} Profesional
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}