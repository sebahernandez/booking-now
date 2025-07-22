import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testNextAuth() {
  try {
    console.log('🔐 Testing NextAuth compatibility...')
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@booking-now.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('👤 Admin user details:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Password set: ${!!admin.password}`)
    console.log(`   Created: ${admin.createdAt}`)

    // Test password hash
    if (admin.password) {
      const passwordTest = await bcrypt.compare('admin123', admin.password)
      console.log(`   Password 'admin123' matches: ${passwordTest}`)
      
      // Also test with wrong password
      const wrongPasswordTest = await bcrypt.compare('wrong123', admin.password)
      console.log(`   Wrong password matches: ${wrongPasswordTest}`)
    }

    // Check NextAuth tables exist
    console.log('\n🗄️ Checking NextAuth tables...')
    
    try {
      const accounts = await prisma.account.count()
      console.log(`   Accounts table: ✅ (${accounts} records)`)
    } catch {
      console.log('   Accounts table: ❌ Not accessible')
    }

    try {
      const sessions = await prisma.session.count()
      console.log(`   Sessions table: ✅ (${sessions} records)`)
    } catch {
      console.log('   Sessions table: ❌ Not accessible')
    }

    try {
      const verificationTokens = await prisma.verificationToken.count()
      console.log(`   VerificationTokens table: ✅ (${verificationTokens} records)`)
    } catch {
      console.log('   VerificationTokens table: ❌ Not accessible')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNextAuth()