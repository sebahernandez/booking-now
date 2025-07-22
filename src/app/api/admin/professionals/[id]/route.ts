import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfessionalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  isAvailable: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional()
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
    const validatedData = updateProfessionalSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      // Get professional with user info
      const professional = await tx.professional.findUnique({
        where: { id: params.id },
        include: { user: true }
      })

      if (!professional) {
        throw new Error("Profesional no encontrado")
      }

      // Update user
      await tx.user.update({
        where: { id: professional.userId },
        data: {
          name: validatedData.name,
          phone: validatedData.phone
        }
      })

      // Update professional
      const updatedProfessional = await tx.professional.update({
        where: { id: params.id },
        data: {
          bio: validatedData.bio,
          hourlyRate: validatedData.hourlyRate,
          isAvailable: validatedData.isAvailable
        }
      })

      // Update service relationships if provided
      if (validatedData.serviceIds !== undefined) {
        // Remove existing service relationships
        await tx.professionalService.deleteMany({
          where: { professionalId: params.id }
        })

        // Add new service relationships
        if (validatedData.serviceIds.length > 0) {
          await tx.professionalService.createMany({
            data: validatedData.serviceIds.map(serviceId => ({
              professionalId: params.id,
              serviceId
            }))
          })
        }
      }

      return updatedProfessional
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Professional API PUT error:", error)
    return NextResponse.json(
      { error: "Error al actualizar profesional" },
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

    // Check if professional has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        professionalId: params.id,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un profesional con reservas activas" },
        { status: 400 }
      )
    }

    // Get professional to get user ID
    const professional = await prisma.professional.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      )
    }

    // Delete in transaction (professional deletion will cascade)
    await prisma.$transaction(async (tx) => {
      // Delete professional (will cascade to professional_services)
      await tx.professional.delete({
        where: { id: params.id }
      })

      // Delete user
      await tx.user.delete({
        where: { id: professional.userId }
      })
    })

    return NextResponse.json({ message: "Profesional eliminado exitosamente" })
  } catch (error) {
    console.error("Professional API DELETE error:", error)
    return NextResponse.json(
      { error: "Error al eliminar profesional" },
      { status: 500 }
    )
  }
}