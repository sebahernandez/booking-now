'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Service {
  id: string;
  name: string;
  isActive: boolean;
  availabilitySchedule?: ServiceAvailability[];
}

interface ServiceAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' },
];

export function ServiceAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  service,
}: ServiceAvailabilityModalProps) {
  const [availabilities, setAvailabilities] = useState<ServiceAvailability[]>([]);
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (service) {
      setAvailabilities(service.availabilitySchedule || []);
    }
    setErrors({});
  }, [service, isOpen]);

  const validateNewAvailability = () => {
    const newErrors: Record<string, string> = {};

    if (!newAvailability.dayOfWeek) {
      newErrors.dayOfWeek = 'Selecciona un dia';
    }

    if (!newAvailability.startTime) {
      newErrors.startTime = 'Hora de inicio requerida';
    }

    if (!newAvailability.endTime) {
      newErrors.endTime = 'Hora de fin requerida';
    }

    if (newAvailability.startTime && newAvailability.endTime) {
      if (newAvailability.startTime >= newAvailability.endTime) {
        newErrors.endTime = 'La hora de fin debe ser posterior a la de inicio';
      }
    }

    // Check for conflicts
    const dayOfWeek = Number(newAvailability.dayOfWeek);
    const existingForDay = availabilities.find(a => a.dayOfWeek === dayOfWeek);
    if (existingForDay) {
      newErrors.dayOfWeek = 'Ya existe disponibilidad para este dia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAvailability = () => {
    if (!validateNewAvailability()) {
      return;
    }

    const newAv: ServiceAvailability = {
      id: Date.now().toString(),
      dayOfWeek: Number(newAvailability.dayOfWeek),
      startTime: newAvailability.startTime,
      endTime: newAvailability.endTime,
    };

    setAvailabilities(prev => [...prev, newAv]);
    setNewAvailability({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
    });
    setErrors({});
  };

  const handleRemoveAvailability = (id: string) => {
    setAvailabilities(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    if (!service) return;

    setLoading(true);
    const toastId = toast.showLoading("Guardando horarios de disponibilidad...");

    try {
      const response = await fetch(`/api/tenant/services/${service.id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilities: availabilities.map(a => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        }),
      });

      if (response.ok) {
        toast.updateToast(toastId, "success", "Horarios de disponibilidad guardados exitosamente");
        onSave();
      } else {
        const errorData = await response.json();
        toast.updateToast(toastId, "error", errorData.error || "Error al guardar disponibilidad");
        setErrors({ submit: errorData.error || 'Error al guardar disponibilidad' });
      }
    } catch {
      toast.updateToast(toastId, "error", "Error de conexión");
      setErrors({ submit: 'Error de conexion' });
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || 'Desconocido';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Configurar Disponibilidad - {service?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing availabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horarios configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {availabilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay horarios configurados</p>
                  <p className="text-sm">Agrega horarios de disponibilidad para este servicio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availabilities
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((availability) => (
                      <div
                        key={availability.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">
                            {getDayName(availability.dayOfWeek)}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {availability.startTime} - {availability.endTime}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAvailability(availability.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add new availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar nuevo horario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dayOfWeek">Dia de la semana</Label>
                <Select
                  value={newAvailability.dayOfWeek}
                  onValueChange={(value) =>
                    setNewAvailability(prev => ({ ...prev, dayOfWeek: value }))
                  }
                >
                  <SelectTrigger className={errors.dayOfWeek ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem
                        key={day.value}
                        value={day.value.toString()}
                        disabled={availabilities.some(a => a.dayOfWeek === day.value)}
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dayOfWeek && <p className="text-red-500 text-sm mt-1">{errors.dayOfWeek}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Hora de inicio</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startTime"
                      type="time"
                      value={newAvailability.startTime}
                      onChange={(e) =>
                        setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))
                      }
                      className={`pl-10 ${errors.startTime ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <Label htmlFor="endTime">Hora de fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endTime"
                      type="time"
                      value={newAvailability.endTime}
                      onChange={(e) =>
                        setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))
                      }
                      className={`pl-10 ${errors.endTime ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddAvailability}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar horario
              </Button>
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
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}