import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicates() {
  try {
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
    for (const [, group] of serviceGroups) {
      if (group.length > 1) {
        // Keep the first one (oldest), delete the rest
        const toDelete = group.slice(1)
        
        for (const duplicate of toDelete) {
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
      }
    }

    console.log('✅ Duplicate services cleaned successfully')

  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDuplicates()