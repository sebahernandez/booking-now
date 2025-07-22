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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        professionals: {
          include: {
            professional: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Services API GET error:", error)
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.create({
      data: validatedData
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Services API POST error:", error)
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 }
    )
  }
}