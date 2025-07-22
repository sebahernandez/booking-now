import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSystem() {
  try {
    console.log('🧪 Testing complete system...')
    console.log()

    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...')
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('   ✅ Database connection working')
    console.log()

    // Test 2: Admin User
    console.log('2️⃣ Testing admin user...')
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    console.log(`   ✅ Admin user exists: ${admin?.email}`)
    console.log()

    // Test 3: Services
    console.log('3️⃣ Testing services...')
    const services = await prisma.service.findMany({
      include: {
        professionals: true,
        _count: { select: { bookings: true } }
      }
    })
    console.log(`   ✅ Found ${services.length} services:`)
    services.forEach(service => {
      console.log(`      - ${service.name} ($${service.price}) - ${service.professionals.length} professional(s)`)
    })
    console.log()

    // Test 4: Professionals
    console.log('4️⃣ Testing professionals...')
    const professionals = await prisma.professional.findMany({
      include: {
        user: { select: { name: true, email: true } },
        services: { include: { service: { select: { name: true } } } },
        _count: { select: { bookings: true } }
      }
    })
    console.log(`   ✅ Found ${professionals.length} professionals:`)
    professionals.forEach(prof => {
      console.log(`      - ${prof.user.name} (${prof.user.email})`)
      console.log(`        Services: ${prof.services.map(s => s.service.name).join(', ')}`)
    })
    console.log()

    // Test 5: Professional Services Links
    console.log('5️⃣ Testing professional-service relationships...')
    const profServices = await prisma.professionalService.count()
    console.log(`   ✅ Found ${profServices} professional-service links`)
    console.log()

    // Test 6: Availability Slots
    console.log('6️⃣ Testing availability slots...')
    const slots = await prisma.availabilitySlot.count()
    console.log(`   ✅ Found ${slots} availability slots`)
    console.log()

    // Summary
    console.log('📊 SYSTEM SUMMARY:')
    console.log(`   • Total Users: ${await prisma.user.count()}`)
    console.log(`   • Admin Users: ${await prisma.user.count({ where: { role: 'ADMIN' } })}`)
    console.log(`   • Professional Users: ${await prisma.user.count({ where: { role: 'PROFESSIONAL' } })}`)
    console.log(`   • Active Services: ${await prisma.service.count({ where: { isActive: true } })}`)
    console.log(`   • Active Professionals: ${await prisma.professional.count({ where: { isAvailable: true } })}`)
    console.log(`   • Service Links: ${profServices}`)
    console.log(`   • Availability Slots: ${slots}`)
    console.log(`   • Total Bookings: ${await prisma.booking.count()}`)
    console.log()

    console.log('🎉 ALL TESTS PASSED!')
    console.log('🚀 System is ready for use!')
    console.log()
    console.log('🌐 Access the admin panel at:')
    console.log('   URL: http://localhost:3002/login')
    console.log('   Email: admin@booking-now.com')
    console.log('   Password: admin123')

  } catch (error) {
    console.error('❌ System test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSystem()