const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getTenantInfo() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (tenant) {
      console.log('Tenant ID:', tenant.id);
      console.log('Tenant Name:', tenant.name);
      if (tenant.services[0]) {
        console.log('Service ID:', tenant.services[0].id);
        console.log('Service Name:', tenant.services[0].name);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTenantInfo();