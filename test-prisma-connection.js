// Test Prisma connection exactly as NextAuth would use it
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

console.log('🌍 Environment variables loaded:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 80) + '...');
console.log('NODE_ENV:', process.env.NODE_ENV);

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing Prisma connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test the exact query that fails in NextAuth
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@booking-now.com'
      }
    });
    
    console.log('👤 User query result:', {
      found: !!user,
      email: user?.email,
      role: user?.role
    });
    
    // Test a simple count query
    const userCount = await prisma.user.count();
    console.log('📊 Total users:', userCount);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      clientVersion: error.clientVersion
    });
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();