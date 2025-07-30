import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Solo permitir con un token secreto
  const debugToken = request.nextUrl.searchParams.get('token');
  if (debugToken !== 'debug123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Testing Prisma connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('👤 User count:', userCount);

    // Test finding the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@booking-now.com' }
    });

    console.log('🔍 Admin user found:', !!adminUser);

    const result = {
      connection: 'success',
      userCount,
      adminUserExists: !!adminUser,
      adminUserData: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      } : null
    };

    await prisma.$disconnect();
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Prisma connection error:', error);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        preview: process.env.DATABASE_URL?.substring(0, 50) + '...'
      }
    }, { status: 500 });
  }
}