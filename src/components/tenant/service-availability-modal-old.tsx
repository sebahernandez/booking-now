"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";

interface ServiceAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ServiceAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  serviceId: string | null;
  serviceName: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(timeString);
    }
  }
  return times;
};

export function ServiceAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  serviceId,
  serviceName,
}: ServiceAvailabilityModalProps) {
  const [schedules, setSchedules] = useState<ServiceAvailability[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timeOptions = generateTimeOptions();

  const fetchSchedules = useCallback(async () => {
    if (!serviceId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/tenant/services/${serviceId}/availability`
      );
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        throw new Error("Error al cargar horarios");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchSchedules();
    }
  }, [isOpen, serviceId, fetchSchedules]);

  const handleAddSchedule = async () => {
    if (
      !serviceId ||
      !newSchedule.dayOfWeek ||
      !newSchedule.startTime ||
      !newSchedule.endTime
    ) {
      setError("Todos los campos son requeridos");
      return;
    }

    if (newSchedule.startTime >= newSchedule.endTime) {
      setError("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/tenant/services/${serviceId}/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayOfWeek: parseInt(newSchedule.dayOfWeek),
            startTime: newSchedule.startTime,
            endTime: newSchedule.endTime,
          }),
        }
      );

      if (response.ok) {
        await fetchSchedules();
        setNewSchedule({ dayOfWeek: "", startTime: "", endTime: "" });
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al agregar horario");
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      setError("Error al agregar horario");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!serviceId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/tenant/services/${serviceId}/availability/${scheduleId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchSchedules();
      } else {
        throw new Error("Error al eliminar horario");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("Error al eliminar el horario");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleClose = () => {
    setSchedules([]);
    setNewSchedule({ dayOfWeek: "", startTime: "", endTime: "" });
    setError("");
    onClose();
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, ServiceAvailability[]>);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horarios de Disponibilidad - {serviceName}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Agregar nuevo horario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar Horario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dayOfWeek">Día de la semana</Label>
                  <Select
                    value={newSchedule.dayOfWeek}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, dayOfWeek: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startTime">Hora de inicio</Label>
                  <Select
                    value={newSchedule.startTime}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, startTime: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endTime">Hora de fin</Label>
                  <Select
                    value={newSchedule.endTime}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, endTime: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddSchedule}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horarios existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Horarios Configurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando horarios...</div>
              ) : Object.keys(groupedSchedules).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay horarios configurados para este servicio.
                  <br />
                  <span className="text-sm">
                    Sin horarios configurados, el servicio estará disponible
                    24/7.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySchedules = groupedSchedules[day.value] || [];
                    if (daySchedules.length === 0) return null;

                    return (
                      <div key={day.value} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-3">
                          {day.label}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between bg-gray-50 rounded-md p-3"
                            >
                              <span className="font-medium">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSchedule(schedule.id)
                                }
                                className="text-red-600 hover:bg-red-50"
                                disabled={loading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cerrar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
