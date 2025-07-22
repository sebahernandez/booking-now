import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const professionals = await prisma.professional.findMany({
      where: {
        isAvailable: true,
        ...(serviceId && {
          services: {
            some: {
              serviceId: serviceId,
            },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professionals' },
      { status: 500 }
    );
  }
}