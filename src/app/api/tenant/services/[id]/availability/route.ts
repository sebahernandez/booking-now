import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar que el servicio pertenece al tenant
    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const availability = await prisma.serviceAvailability.findMany({
      where: {
        serviceId: id,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Map day numbers to day names
    const dayNames = [
      "Domingo", "Lunes", "Martes", "Miércoles", 
      "Jueves", "Viernes", "Sábado"
    ];

    const availabilityWithDayNames = availability.map(schedule => ({
      ...schedule,
      dayName: dayNames[schedule.dayOfWeek]
    }));

    return NextResponse.json(availabilityWithDayNames);
  } catch (error) {
    console.error("Error fetching service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        {
          error:
            "Día de la semana, hora de inicio y hora de fin son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar que el servicio pertenece al tenant
    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Validar formato de horarios
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Formato de hora inválido. Use HH:MM (ej: 09:00)" },
        { status: 400 }
      );
    }

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "La hora de inicio debe ser anterior a la hora de fin" },
        { status: 400 }
      );
    }

    // Verificar conflictos de horarios
    const conflictingSchedule = await prisma.serviceAvailability.findFirst({
      where: {
        serviceId: id,
        dayOfWeek: parseInt(dayOfWeek),
        isActive: true,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: "El horario se superpone con un horario existente" },
        { status: 409 }
      );
    }

    const availability = await prisma.serviceAvailability.create({
      data: {
        serviceId: id,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        isActive: true,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error("Error creating service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

interface ScheduleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isTenant || !session.user.tenantId) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Support both single schedule and array of schedules
    let schedules: ScheduleData[];
    
    if (body.schedules !== undefined) {
      // Array format: { schedules: [...] }
      schedules = Array.isArray(body.schedules) ? body.schedules : [body.schedules];
    } else if (body.availabilities !== undefined) {
      // Alternative array format: { availabilities: [...] }
      schedules = Array.isArray(body.availabilities) ? body.availabilities : [body.availabilities];
    } else if (body.dayOfWeek !== undefined && body.startTime && body.endTime) {
      // Single schedule format: { dayOfWeek, startTime, endTime }
      schedules = [{ dayOfWeek: body.dayOfWeek, startTime: body.startTime, endTime: body.endTime }];
    } else {
      // More detailed error message
      const missingFields = [];
      if (body.dayOfWeek === undefined) missingFields.push('dayOfWeek');
      if (!body.startTime) missingFields.push('startTime');
      if (!body.endTime) missingFields.push('endTime');
      
      return NextResponse.json(
        { 
          error: `Faltan campos requeridos: ${missingFields.join(', ')}. Se requiere un horario (dayOfWeek, startTime, endTime) o un array de horarios (schedules/availabilities)`,
          received: body
        },
        { status: 400 }
      );
    }

    // Verificar que el servicio pertenece al tenant
    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Validar todos los horarios antes de crear
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const schedule of schedules) {
      const { dayOfWeek, startTime, endTime } = schedule;

      if (dayOfWeek === undefined || !startTime || !endTime) {
        return NextResponse.json(
          {
            error:
              "Cada horario debe tener día de la semana, hora de inicio y hora de fin",
          },
          { status: 400 }
        );
      }

      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json(
          { error: "Formato de hora inválido. Use HH:MM (ej: 09:00)" },
          { status: 400 }
        );
      }

      if (startTime >= endTime) {
        return NextResponse.json(
          { error: "La hora de inicio debe ser anterior a la hora de fin" },
          { status: 400 }
        );
      }
    }

    // Usar transacción para reemplazar todos los horarios
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar horarios existentes
      await tx.serviceAvailability.deleteMany({
        where: { serviceId: id },
      });

      // Crear nuevos horarios
      if (schedules.length > 0) {
        await tx.serviceAvailability.createMany({
          data: schedules.map((schedule: ScheduleData) => ({
            serviceId: id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: true,
          })),
        });
      }

      // Retornar los nuevos horarios
      return await tx.serviceAvailability.findMany({
        where: { serviceId: id },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating service availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
