require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { 
        email: 'admin@booking-now.com',
        role: 'ADMIN' 
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      hasPassword: !!admin.password
    });
    
    // Test password
    if (admin.password) {
      const isPasswordValid = await bcrypt.compare('admin123', admin.password);
      console.log('🔐 Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('📊 Total users in database:', userCount);
    
    console.log('🎉 Admin login test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();