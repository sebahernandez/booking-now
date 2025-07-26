"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Clock,
  Calendar,
  Sun,
  Moon,
  Coffee,
  Sunset,
  Check,
  X,
} from "lucide-react";

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

interface TimeSlot {
  value: string;
  label: string;
  icon?: React.ReactNode;
  period: "morning" | "afternoon" | "evening" | "night";
}

const DAYS_OF_WEEK = [
  {
    value: 0,
    label: "Domingo",
    short: "Dom",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  {
    value: 1,
    label: "Lunes",
    short: "Lun",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  {
    value: 2,
    label: "Martes",
    short: "Mar",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  },
  {
    value: 3,
    label: "Miércoles",
    short: "Mié",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  {
    value: 4,
    label: "Jueves",
    short: "Jue",
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
  {
    value: 5,
    label: "Viernes",
    short: "Vie",
    color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  },
  {
    value: 6,
    label: "Sábado",
    short: "Sáb",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  },
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = new Date(
        `2000-01-01T${timeString}`
      ).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      let period: "morning" | "afternoon" | "evening" | "night";
      let icon: React.ReactNode;

      if (hour >= 6 && hour < 12) {
        period = "morning";
        icon = <Sun className="w-3 h-3" />;
      } else if (hour >= 12 && hour < 18) {
        period = "afternoon";
        icon = <Coffee className="w-3 h-3" />;
      } else if (hour >= 18 && hour < 22) {
        period = "evening";
        icon = <Sunset className="w-3 h-3" />;
      } else {
        period = "night";
        icon = <Moon className="w-3 h-3" />;
      }

      slots.push({
        value: timeString,
        label: displayTime,
        icon,
        period,
      });
    }
  }

  return slots;
};

const TimeSlotPicker = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeSlots = generateTimeSlots();

  const selectedSlot = timeSlots.find((slot) => slot.value === value);

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.period]) acc[slot.period] = [];
    acc[slot.period].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const periodLabels = {
    morning: "Mañana",
    afternoon: "Tarde",
    evening: "Noche",
    night: "Madrugada",
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={`w-full justify-start text-left font-normal ${
          !value && "text-muted-foreground"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedSlot ? (
          <div className="flex items-center gap-2">
            {selectedSlot.icon}
            {selectedSlot.label}
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
        <Clock className="ml-auto h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedSlots).map(([period, slots]) => (
            <div key={period} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {slots[0].icon}
                <span className="text-sm font-medium text-gray-700">
                  {periodLabels[period as keyof typeof periodLabels]}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    className={`p-2 text-xs rounded-md border transition-colors ${
                      value === slot.value
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      onChange(slot.value);
                      setIsOpen(false);
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function ServiceAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  serviceId,
  serviceName,
}: ServiceAvailabilityModalProps) {
  const [schedules, setSchedules] = useState<ServiceAvailability[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      selectedDay === null ||
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
            dayOfWeek: selectedDay,
            startTime: newSchedule.startTime,
            endTime: newSchedule.endTime,
          }),
        }
      );

      if (response.ok) {
        await fetchSchedules();
        setNewSchedule({ startTime: "", endTime: "" });
        setSelectedDay(null);
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
    setNewSchedule({ startTime: "", endTime: "" });
    setSelectedDay(null);
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">
                Horarios de Disponibilidad
              </div>
              <div className="text-sm font-normal text-gray-500 mt-1">
                {serviceName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Agregar nuevo horario */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Nuevo Horario
              </h3>
            </div>

            {/* Selección de día */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Seleccionar día de la semana
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                      selectedDay === day.value
                        ? "bg-blue-100 border-blue-300 text-blue-700 scale-105 shadow-md"
                        : `${day.color} border transition-colors`
                    }`}
                    onClick={() => setSelectedDay(day.value)}
                  >
                    <div className="text-xs font-medium">{day.short}</div>
                    <div className="text-xs opacity-75">{day.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de horarios */}
            {selectedDay !== null && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Hora de inicio
                    </label>
                    <TimeSlotPicker
                      value={newSchedule.startTime}
                      onChange={(value) =>
                        setNewSchedule({ ...newSchedule, startTime: value })
                      }
                      placeholder="Seleccionar hora de inicio"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Hora de fin
                    </label>
                    <TimeSlotPicker
                      value={newSchedule.endTime}
                      onChange={(value) =>
                        setNewSchedule({ ...newSchedule, endTime: value })
                      }
                      placeholder="Seleccionar hora de fin"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddSchedule}
                  disabled={
                    loading || !newSchedule.startTime || !newSchedule.endTime
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Horario
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Horarios configurados */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Horarios Configurados
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando horarios...</p>
              </div>
            ) : Object.keys(groupedSchedules).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  No hay horarios configurados
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Sin horarios configurados, el servicio estará disponible 24/7
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedules = groupedSchedules[day.value] || [];
                  if (daySchedules.length === 0) return null;

                  return (
                    <div
                      key={day.value}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`${day.color} font-medium`}>
                          {day.label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {daySchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            {Object.keys(groupedSchedules).length > 0 && (
              <>
                ✓ {Object.values(groupedSchedules).flat().length} horarios
                configurados
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
