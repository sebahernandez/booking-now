require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function recreateAdmin() {
  try {
    console.log('🗑️ Deleting existing admin...');
    
    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email: 'admin@booking-now.com' }
    });
    
    console.log('👨‍💼 Creating new admin user...');
    
    // Create new admin with fresh hash
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@booking-now.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Details:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });
    
    // Test the password immediately
    console.log('🔐 Testing password...');
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID');

  } catch (error) {
    console.error('❌ Error recreating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateAdmin();