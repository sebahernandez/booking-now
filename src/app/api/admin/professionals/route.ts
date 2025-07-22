import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const professionalSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  isAvailable: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional()
})

const updateProfessionalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  isAvailable: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const professionals = await prisma.professional.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        user: {
          createdAt: "desc"
        }
      }
    })

    return NextResponse.json(professionals)
  } catch (error) {
    console.error("Professionals API GET error:", error)
    return NextResponse.json(
      { error: "Error al obtener profesionales" },
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
    const validatedData = professionalSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user and professional in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
          password: hashedPassword,
          role: "PROFESSIONAL"
        }
      })

      // Create professional
      const professional = await tx.professional.create({
        data: {
          userId: user.id,
          bio: validatedData.bio,
          hourlyRate: validatedData.hourlyRate,
          isAvailable: validatedData.isAvailable
        }
      })

      // Link services if provided
      if (validatedData.serviceIds && validatedData.serviceIds.length > 0) {
        await tx.professionalService.createMany({
          data: validatedData.serviceIds.map(serviceId => ({
            professionalId: professional.id,
            serviceId
          }))
        })
      }

      return { user, professional }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Professionals API POST error:", error)
    return NextResponse.json(
      { error: "Error al crear profesional" },
      { status: 500 }
    )
  }
}