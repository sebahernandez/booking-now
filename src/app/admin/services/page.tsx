"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import ServiceModal from "@/components/admin/service-modal"

interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  isActive: boolean
  createdAt: string
  professionals: Array<{
    professional: {
      user: {
        name: string
        email: string
      }
    }
  }>
  _count: {
    bookings: number
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = () => {
    setSelectedService(null)
    setModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setModalOpen(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        fetchServices()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar el servicio")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      alert("Error al eliminar el servicio")
    }
  }

  const handleServiceSaved = () => {
    fetchServices()
    setModalOpen(false)
  }

  if (loading) {
    return <div>Cargando servicios...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600">Gestiona los servicios disponibles</p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {service.description || "Sin descripción"}
                  </CardDescription>
                </div>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration} min
                </div>
                <div className="flex items-center font-semibold text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${service.price}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>{service.professionals.length} profesional(es) asignado(s)</p>
                <p>{service._count.bookings} reserva(s) realizadas</p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditService(service)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay servicios registrados</p>
          <Button onClick={handleCreateService}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Servicio
          </Button>
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={selectedService}
        onSaved={handleServiceSaved}
      />
    </div>
  )
}