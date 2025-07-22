import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true)
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(service)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Service API PUT error:", error)
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if service has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: params.id,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un servicio con reservas activas" },
        { status: 400 }
      )
    }

    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Servicio eliminado exitosamente" })
  } catch (error) {
    console.error("Service API DELETE error:", error)
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 }
    )
  }
}