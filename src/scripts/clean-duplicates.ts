import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicates() {
  try {
    console.log('🧹 Cleaning duplicate services...')

    // Get all services grouped by name
    const services = await prisma.service.findMany({
      include: {
        professionals: true,
        bookings: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const serviceGroups = new Map<string, typeof services>()
    
    // Group services by name
    for (const service of services) {
      if (!serviceGroups.has(service.name)) {
        serviceGroups.set(service.name, [])
      }
      serviceGroups.get(service.name)!.push(service)
    }

    // Process each group
    for (const [name, group] of serviceGroups) {
      if (group.length > 1) {
        console.log(`Found ${group.length} duplicates of "${name}"`)
        
        // Keep the first one (oldest), delete the rest
        const toKeep = group[0]
        const toDelete = group.slice(1)
        
        for (const duplicate of toDelete) {
          console.log(`  Deleting duplicate: ${duplicate.id}`)
          
          // Delete professional service links first
          await prisma.professionalService.deleteMany({
            where: { serviceId: duplicate.id }
          })
          
          // Delete bookings if any
          await prisma.booking.deleteMany({
            where: { serviceId: duplicate.id }
          })
          
          // Delete the service
          await prisma.service.delete({
            where: { id: duplicate.id }
          })
        }
        
        console.log(`  Kept: ${toKeep.id} (${toKeep.name})`)
      }
    }

    // Show final count
    const finalCount = await prisma.service.count()
    console.log(`✅ Cleanup complete! Now have ${finalCount} unique services`)

    // Show remaining services
    const remainingServices = await prisma.service.findMany({
      include: {
        professionals: true
      }
    })

    console.log('\n📋 Remaining services:')
    remainingServices.forEach(service => {
      console.log(`   - ${service.name} ($${service.price}) - ${service.professionals.length} professional(s)`)
    })

  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDuplicates()