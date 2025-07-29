require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication process...');
    
    const email = 'admin@booking-now.com';
    const password = 'admin123';
    
    console.log('📧 Looking for user with email:', email);
    
    // Try to find user exactly as the auth function does
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
    
    console.log('👤 User found:', {
      exists: !!user,
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      hasPassword: !!user?.password,
      tenantId: user?.tenantId
    });
    
    if (user && user.password) {
      console.log('🔐 Testing password...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('✅ Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('🎉 Authentication should work!');
        console.log('User object that should be returned:', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId || undefined,
          isTenant: false,
        });
      } else {
        console.log('❌ Password is invalid');
        
        // Let's check what the stored password hash looks like
        console.log('🔍 Stored password hash (first 20 chars):', user.password.substring(0, 20));
        
        // Let's try creating a new hash with the same password to compare
        const newHash = await bcrypt.hash(password, 12);
        console.log('🆕 New hash (first 20 chars):', newHash.substring(0, 20));
        
        // Test with the new hash
        const testNewHash = await bcrypt.compare(password, newHash);
        console.log('✅ New hash test:', testNewHash);
      }
    } else {
      console.log('❌ User not found or has no password');
    }
    
    // Also check environment variables
    console.log('\n🌍 Environment variables:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();