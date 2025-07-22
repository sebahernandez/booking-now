"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, User, Mail, Calendar, Clock } from "lucide-react"
import ProfessionalModal from "@/components/admin/professional-modal"
import { AvailabilityManager } from "@/components/admin/availability-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Professional {
  id: string
  bio?: string
  hourlyRate?: number
  isAvailable: boolean
  user: {
    id: string
    email: string
    name?: string
    phone?: string
    createdAt: string
  }
  services: Array<{
    service: {
      id: string
      name: string
      price: number
    }
  }>
  _count: {
    bookings: number
  }
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/admin/professionals")
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      }
    } catch (error) {
      console.error("Error fetching professionals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfessional = () => {
    setSelectedProfessional(null)
    setModalOpen(true)
  }

  const handleEditProfessional = (professional: Professional) => {
    setSelectedProfessional(professional)
    setModalOpen(true)
  }

  const handleDeleteProfessional = async (professionalId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este profesional?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchProfessionals()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar el profesional")
      }
    } catch (error) {
      console.error("Error deleting professional:", error)
      alert("Error al eliminar el profesional")
    }
  }

  const handleProfessionalSaved = () => {
    fetchProfessionals()
    setModalOpen(false)
  }

  const handleManageAvailability = (professional: Professional) => {
    setSelectedProfessional(professional)
    setAvailabilityModalOpen(true)
  }

  if (loading) {
    return <div>Cargando profesionales...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profesionales</h1>
          <p className="text-gray-600">Gestiona los profesionales del sistema</p>
        </div>
        <Button onClick={handleCreateProfessional}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Profesional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {professional.user.name || "Sin nombre"}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {professional.user.email}
                  </CardDescription>
                </div>
                <Badge variant={professional.isAvailable ? "default" : "secondary"}>
                  {professional.isAvailable ? "Disponible" : "No disponible"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {professional.user.phone && (
                <div className="text-sm text-gray-600">
                  <strong>Teléfono:</strong> {professional.user.phone}
                </div>
              )}
              
              {professional.bio && (
                <div className="text-sm text-gray-600">
                  <strong>Bio:</strong> {professional.bio}
                </div>
              )}

              {professional.hourlyRate && (
                <div className="text-sm text-gray-600">
                  <strong>Tarifa por hora:</strong> ${professional.hourlyRate}
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <p>{professional.services.length} servicio(s) asignado(s)</p>
                <p>{professional._count.bookings} reserva(s) realizadas</p>
              </div>

              {professional.services.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Servicios:</p>
                  <div className="flex flex-wrap gap-1">
                    {professional.services.slice(0, 2).map((service) => (
                      <Badge key={service.service.id} variant="outline" className="text-xs">
                        {service.service.name}
                      </Badge>
                    ))}
                    {professional.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.services.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <Calendar className="w-4 h-4 inline mr-1" />
                Registrado: {new Date(professional.user.createdAt).toLocaleDateString("es-ES")}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditProfessional(professional)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleManageAvailability(professional)}
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Horarios
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteProfessional(professional.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay profesionales registrados</p>
          <Button onClick={handleCreateProfessional}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar Primer Profesional
          </Button>
        </div>
      )}

      <ProfessionalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        professional={selectedProfessional}
        onSaved={handleProfessionalSaved}
      />

      <Dialog open={availabilityModalOpen} onOpenChange={setAvailabilityModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Disponibilidad</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <AvailabilityManager
              professionalId={selectedProfessional.id}
              professionalName={selectedProfessional.user.name || selectedProfessional.user.email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}