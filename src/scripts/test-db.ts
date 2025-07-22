import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')
    console.log('Result:', result)
    
    // Try to query users table
    const userCount = await prisma.user.count()
    console.log(`📊 Found ${userCount} users in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error details:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Tenant or user not found')) {
        console.log('\n🔧 Possible solutions:')
        console.log('1. Check your DATABASE_URL in .env.local')
        console.log('2. Verify Supabase credentials are correct')
        console.log('3. Try running: npx prisma db push')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()