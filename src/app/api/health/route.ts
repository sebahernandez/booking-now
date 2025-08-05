import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get some basic stats
    const stats = await Promise.all([
      prisma.tenant.count(),
      prisma.booking.count(),
      prisma.service.count()
    ]);

    return Response.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      stats: {
        tenants: stats[0],
        bookings: stats[1],
        services: stats[2]
      }
    });
  } catch (error) {
    const err = error as Error & { code?: string };
    
    console.error('Health check failed:', {
      message: err.message,
      code: err.code,
      name: err.name
    });

    return Response.json({ 
      status: 'error', 
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: {
        message: err.message || 'Unknown database error',
        code: err.code || 'UNKNOWN',
        name: err.name || 'Error'
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}