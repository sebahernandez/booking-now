'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, FileText, Briefcase } from 'lucide-react';

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
    name: '',
    description: '',
    duration: '',
    price: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration.toString() || '',
        price: service.price.toString() || '',
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [service, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del servicio es requerido';
    }

    if (!formData.duration || isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'La duracion debe ser un numero mayor a 0';
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un numero mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
        : '/api/tenant/services';
        
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Error al guardar el servicio' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexion' });
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
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="name">Nombre del servicio *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Corte de cabello"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripcion</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el servicio que ofreces..."
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duracion (minutos) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="60"
                      className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <Label htmlFor="price">Precio (CLP) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="25000"
                      className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
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
              {loading ? 'Guardando...' : (service ? 'Actualizar' : 'Crear')} Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}