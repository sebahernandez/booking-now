"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Plus, Trash2, Save } from "lucide-react";
import { ProfessionalAvailability, WeeklySchedule, TimeSlot } from "@/types/booking";

interface AvailabilityManagerProps {
  professionalId: string;
  professionalName: string;
}

const dayNames = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function AvailabilityManager({
  professionalId,
  professionalName,
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<ProfessionalAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<keyof WeeklySchedule | null>(null);
  const [newTimeSlot, setNewTimeSlot] = useState({ startTime: "09:00", endTime: "10:00" });

  useEffect(() => {
    fetchAvailability();
  }, [professionalId]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/professionals/availability/${professionalId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    if (!availability) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/professionals/availability/${professionalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAvailability(updatedData);
      }
    } catch (error) {
      console.error("Error saving availability:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDayWorking = (day: keyof WeeklySchedule) => {
    if (!availability) return;

    setAvailability({
      ...availability,
      weeklySchedule: {
        ...availability.weeklySchedule,
        [day]: {
          ...availability.weeklySchedule[day],
          isWorking: !availability.weeklySchedule[day].isWorking,
        },
      },
    });
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    if (!availability) return;

    const updatedSchedule = {
      ...availability.weeklySchedule,
      [day]: {
        ...availability.weeklySchedule[day],
        timeSlots: [
          ...availability.weeklySchedule[day].timeSlots,
          { ...newTimeSlot },
        ],
      },
    };

    setAvailability({
      ...availability,
      weeklySchedule: updatedSchedule,
    });

    setNewTimeSlot({ startTime: "09:00", endTime: "10:00" });
    setEditingDay(null);
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    if (!availability) return;

    const updatedSlots = availability.weeklySchedule[day].timeSlots.filter(
      (_, i) => i !== index
    );

    setAvailability({
      ...availability,
      weeklySchedule: {
        ...availability.weeklySchedule,
        [day]: {
          ...availability.weeklySchedule[day],
          timeSlots: updatedSlots,
        },
      },
    });
  };

  if (loading) {
    return <div>Cargando disponibilidad...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Disponibilidad</h3>
          <p className="text-sm text-gray-600">Profesional: {professionalName}</p>
        </div>
        <Button onClick={saveAvailability} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(dayNames).map(([dayKey, dayLabel]) => {
          const day = dayKey as keyof WeeklySchedule;
          const daySchedule = availability?.weeklySchedule[day];

          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{dayLabel}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={daySchedule?.isWorking || false}
                      onCheckedChange={() => toggleDayWorking(day)}
                    />
                    <Label className="text-sm">Trabajar este día</Label>
                  </div>
                </div>
              </CardHeader>

              {daySchedule?.isWorking && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Horarios de trabajo</Label>
                      <Dialog
                        open={editingDay === day}
                        onOpenChange={(open) => setEditingDay(open ? day : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Horario
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agregar Horario - {dayLabel}</DialogTitle>
                            <DialogDescription>
                              Define un nuevo bloque de tiempo para este día
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startTime">Hora de inicio</Label>
                              <Select
                                value={newTimeSlot.startTime}
                                onValueChange={(value) =>
                                  setNewTimeSlot({ ...newTimeSlot, startTime: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                            <div className="space-y-2">
                              <Label htmlFor="endTime">Hora de fin</Label>
                              <Select
                                value={newTimeSlot.endTime}
                                onValueChange={(value) =>
                                  setNewTimeSlot({ ...newTimeSlot, endTime: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingDay(null)}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={() => addTimeSlot(day)}>
                              Agregar Horario
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {daySchedule?.timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(day, index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}

                      {!daySchedule?.timeSlots.length && (
                        <p className="text-sm text-gray-500 italic">
                          No hay horarios configurados para este día
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}

              {!daySchedule?.isWorking && (
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-500">
                    No trabajar este día
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}