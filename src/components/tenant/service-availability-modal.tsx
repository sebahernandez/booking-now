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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".time-picker-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative time-picker-container">
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
        <div className="absolute z-50 mt-1 w-72 sm:w-80 bg-white border rounded-lg shadow-lg p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto left-0 right-0">
          {Object.entries(groupedSlots).map(([period, slots]) => (
            <div key={period} className="mb-3 sm:mb-4">
              <div className="flex items-center gap-2 mb-2">
                {slots[0].icon}
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {periodLabels[period as keyof typeof periodLabels]}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    className={`p-1.5 sm:p-2 text-xs rounded-md border transition-colors ${
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xl sm:text-2xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-lg sm:text-xl font-semibold text-gray-900">
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

        <div className="space-y-6 sm:space-y-8">
          {/* Agregar nuevo horario */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Agregar Nuevo Horario
              </h3>
            </div>

            {/* Selección de día */}
            <div className="mb-4 sm:mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Seleccionar día de la semana
              </h4>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 text-center text-xs sm:text-sm ${
                      selectedDay === day.value
                        ? "bg-blue-100 border-blue-300 text-blue-700 scale-105 shadow-md"
                        : `${day.color} border transition-colors`
                    }`}
                    onClick={() => setSelectedDay(day.value)}
                  >
                    <div className="text-xs opacity-75 sm:block">
                      {day.short}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de horarios */}
            {selectedDay !== null && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Horarios Configurados
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm sm:text-base text-gray-500">
                  Cargando horarios...
                </p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  No hay horarios configurados
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 px-4">
                  Sin horarios configurados, el servicio estará disponible 24/7
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedules
                  .sort((a, b) => {
                    // Ordenar por día de la semana y luego por hora de inicio
                    if (a.dayOfWeek !== b.dayOfWeek) {
                      return a.dayOfWeek - b.dayOfWeek;
                    }
                    return a.startTime.localeCompare(b.startTime);
                  })
                  .map((schedule) => {
                    const day = DAYS_OF_WEEK.find(
                      (d) => d.value === schedule.dayOfWeek
                    );
                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Badge
                            className={`${
                              day?.color ||
                              "bg-gray-50 text-gray-700 border-gray-200"
                            } font-medium text-xs sm:text-sm flex-shrink-0`}
                          >
                            {day?.short || "N/A"}
                          </Badge>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                            {day?.label || "Día desconocido"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 ml-3 flex-shrink-0"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 sm:pt-4">
          <div className="text-xs sm:text-sm text-gray-500">
            {schedules.length > 0 && (
              <>✓ {schedules.length} horarios configurados</>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
