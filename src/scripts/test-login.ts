import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Testing admin login credentials...')
    console.log('Email: admin@booking-now.com')
    console.log('Password: admin123')
    console.log()

    // Find the admin user
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@booking-now.com'
      }
    })

    if (!user) {
      console.log('❌ Admin user not found in database')
      return
    }

    console.log('✅ Admin user found:')
    console.log(`   - ID: ${user.id}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Name: ${user.name}`)
    console.log(`   - Role: ${user.role}`)
    console.log(`   - Has password: ${user.password ? 'Yes' : 'No'}`)
    console.log()

    if (!user.password) {
      console.log('❌ No password set for admin user')
      return
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare('admin123', user.password)
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!')
      console.log('✅ Login credentials are working correctly')
      console.log()
      console.log('🌐 You can now login with:')
      console.log('   URL: http://localhost:3002/login')
      console.log('   Email: admin@booking-now.com')
      console.log('   Password: admin123')
    } else {
      console.log('❌ Password verification failed')
      console.log('❌ The password "admin123" does not match the stored hash')
    }

  } catch (error) {
    console.error('❌ Error testing login credentials:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()