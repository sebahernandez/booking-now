const { PrismaClient: SqlitePrismaClient } = require('@prisma/client');
const { PrismaClient: PostgresPrismaClient } = require('@prisma/client');

// Cliente para SQLite
const sqliteClient = new SqlitePrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Cliente para PostgreSQL
const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

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

    // 3. Migrar Accounts
    console.log('🔐 Migrando Accounts...');
    const accounts = await sqliteClient.account.findMany();
    for (const account of accounts) {
      await postgresClient.account.upsert({
        where: { id: account.id },
        update: {},
        create: {
          id: account.id,
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state
        }
      });
    }
    console.log(`✅ Migradas ${accounts.length} cuentas`);

    // 4. Migrar Sessions
    console.log('🔒 Migrando Sessions...');
    const sessions = await sqliteClient.session.findMany();
    for (const session of sessions) {
      await postgresClient.session.upsert({
        where: { id: session.id },
        update: {},
        create: {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires
        }
      });
    }
    console.log(`✅ Migradas ${sessions.length} sesiones`);

    // 5. Migrar VerificationTokens
    console.log('🎫 Migrando VerificationTokens...');
    const verificationTokens = await sqliteClient.verificationToken.findMany();
    for (const token of verificationTokens) {
      await postgresClient.verificationToken.upsert({
        where: { 
          identifier_token: {
            identifier: token.identifier,
            token: token.token
          }
        },
        update: {},
        create: {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires
        }
      });
    }
    console.log(`✅ Migrados ${verificationTokens.length} tokens de verificación`);

    // 6. Migrar Services
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

    // 7. Migrar ServiceAvailability
    console.log('📅 Migrando ServiceAvailability...');
    const serviceAvailabilities = await sqliteClient.serviceAvailability.findMany();
    for (const availability of serviceAvailabilities) {
      await postgresClient.serviceAvailability.upsert({
        where: { id: availability.id },
        update: {},
        create: {
          id: availability.id,
          serviceId: availability.serviceId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isActive: availability.isActive,
          createdAt: availability.createdAt,
          updatedAt: availability.updatedAt
        }
      });
    }
    console.log(`✅ Migradas ${serviceAvailabilities.length} disponibilidades de servicio`);

    // 8. Migrar Professionals
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

    // 9. Migrar ProfessionalServices
    console.log('🔗 Migrando ProfessionalServices...');
    const professionalServices = await sqliteClient.professionalService.findMany();
    for (const ps of professionalServices) {
      await postgresClient.professionalService.upsert({
        where: { id: ps.id },
        update: {},
        create: {
          id: ps.id,
          professionalId: ps.professionalId,
          serviceId: ps.serviceId,
          customPrice: ps.customPrice,
          createdAt: ps.createdAt
        }
      });
    }
    console.log(`✅ Migradas ${professionalServices.length} relaciones profesional-servicio`);

    // 10. Migrar AvailabilitySlots
    console.log('🕐 Migrando AvailabilitySlots...');
    const availabilitySlots = await sqliteClient.availabilitySlot.findMany();
    for (const slot of availabilitySlots) {
      await postgresClient.availabilitySlot.upsert({
        where: { id: slot.id },
        update: {},
        create: {
          id: slot.id,
          professionalId: slot.professionalId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
          specificDate: slot.specificDate,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt
        }
      });
    }
    console.log(`✅ Migrados ${availabilitySlots.length} slots de disponibilidad`);

    // 11. Migrar Bookings
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
      accounts: await postgresClient.account.count(),
      sessions: await postgresClient.session.count(),
      verificationTokens: await postgresClient.verificationToken.count(),
      services: await postgresClient.service.count(),
      serviceAvailabilities: await postgresClient.serviceAvailability.count(),
      professionals: await postgresClient.professional.count(),
      professionalServices: await postgresClient.professionalService.count(),
      availabilitySlots: await postgresClient.availabilitySlot.count(),
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