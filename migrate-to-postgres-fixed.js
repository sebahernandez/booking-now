require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Cliente para SQLite (usando path específico)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Cliente para PostgreSQL (usando variable de entorno)
const postgresClient = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de SQLite a PostgreSQL...');

    // 1. Migrar Tenants
    console.log('📋 Migrando Tenants...');
    const tenants = await sqliteClient.tenant.findMany();
    for (const tenant of tenants) {
      await postgresClient.tenant.upsert({
        where: { id: tenant.id },
        update: {},
        create: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          password: tenant.password,
          phone: tenant.phone,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt
        }
      });
    }
    console.log(`✅ Migrados ${tenants.length} tenants`);

    // 2. Migrar Users
    console.log('👥 Migrando Users...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          tenantId: user.tenantId,
          password: user.password,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ Migrados ${users.length} usuarios`);

    // 3. Migrar Services
    console.log('🛎️ Migrando Services...');
    const services = await sqliteClient.service.findMany();
    for (const service of services) {
      await postgresClient.service.upsert({
        where: { id: service.id },
        update: {},
        create: {
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          tenantId: service.tenantId,
          isActive: service.isActive,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }
      });
    }
    console.log(`✅ Migrados ${services.length} servicios`);

    // 4. Migrar Professionals
    console.log('👨‍⚕️ Migrando Professionals...');
    const professionals = await sqliteClient.professional.findMany();
    for (const professional of professionals) {
      await postgresClient.professional.upsert({
        where: { id: professional.id },
        update: {},
        create: {
          id: professional.id,
          userId: professional.userId,
          tenantId: professional.tenantId,
          bio: professional.bio,
          hourlyRate: professional.hourlyRate,
          isAvailable: professional.isAvailable,
          createdAt: professional.createdAt,
          updatedAt: professional.updatedAt
        }
      });
    }
    console.log(`✅ Migrados ${professionals.length} profesionales`);

    // 5. Migrar Bookings
    console.log('📝 Migrando Bookings...');
    const bookings = await sqliteClient.booking.findMany();
    for (const booking of bookings) {
      await postgresClient.booking.upsert({
        where: { id: booking.id },
        update: {},
        create: {
          id: booking.id,
          clientId: booking.clientId,
          professionalId: booking.professionalId,
          serviceId: booking.serviceId,
          tenantId: booking.tenantId,
          startDateTime: booking.startDateTime,
          endDateTime: booking.endDateTime,
          status: booking.status,
          totalPrice: booking.totalPrice,
          notes: booking.notes,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        }
      });
    }
    console.log(`✅ Migradas ${bookings.length} reservas`);

    console.log('🎉 ¡Migración completada exitosamente!');
    
    // Verificar conteos
    console.log('\n📊 Verificando migración:');
    const counts = {
      tenants: await postgresClient.tenant.count(),
      users: await postgresClient.user.count(),
      services: await postgresClient.service.count(),
      professionals: await postgresClient.professional.count(),
      bookings: await postgresClient.booking.count()
    };

    console.table(counts);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('✅ Proceso de migración terminado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };