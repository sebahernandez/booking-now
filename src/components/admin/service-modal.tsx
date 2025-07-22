"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  isActive: boolean
}

interface ServiceModalProps {
  open: boolean
  onClose: () => void
  service?: Service | null
  onSaved: () => void
}

export default function ServiceModal({ open, onClose, service, onSaved }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        isActive: service.isActive
      })
    } else {
      setFormData({
        name: "",
        description: "",
        duration: 60,
        price: 0,
        isActive: true
      })
    }
    setErrors({})
  }, [service, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const url = service
        ? `/api/admin/services/${service.id}`
        : "/api/admin/services"
      
      const method = service ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSaved()
        onClose()
      } else {
        const error = await response.json()
        if (error.details) {
          const fieldErrors: Record<string, string> = {}
          error.details.forEach((detail: any) => {
            if (detail.path) {
              fieldErrors[detail.path[0]] = detail.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: error.error || "Error al guardar el servicio" })
        }
      }
    } catch (error) {
      console.error("Error saving service:", error)
      setErrors({ general: "Error al guardar el servicio" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription>
            {service 
              ? "Modifica los datos del servicio" 
              : "Crea un nuevo servicio para el sistema"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-red-600 text-sm">{errors.general}</div>
          )}

          <div>
            <Label htmlFor="name">Nombre del Servicio</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Consulta Médica"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <div className="text-red-600 text-xs mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el servicio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && (
                <div className="text-red-600 text-xs mt-1">{errors.duration}</div>
              )}
            </div>

            <div>
              <Label htmlFor="price">Precio ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <div className="text-red-600 text-xs mt-1">{errors.price}</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Servicio activo</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? "Guardando..." 
                : service 
                  ? "Actualizar" 
                  : "Crear"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}