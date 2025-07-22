import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      professionalId,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service details for duration and price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Create or find user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          role: UserRole.CLIENT,
        },
      });
    }

    // Calculate start and end times
    const [hours, minutes] = time.split(':').map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);

    // Check if the time slot is available
    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        professionalId: professionalId || undefined,
        startDateTime: {
          lte: endDateTime,
        },
        endDateTime: {
          gte: startDateTime,
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        professionalId: professionalId || null,
        serviceId,
        startDateTime,
        endDateTime,
        totalPrice: service.price,
        notes,
        status: BookingStatus.PENDING,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
      },
      orderBy: {
        startDateTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}