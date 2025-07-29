require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');

const postgresClient = new PrismaClient();

async function migrateData() {
  return new Promise((resolve, reject) => {
    // Conectar a SQLite
    const db = new sqlite3.Database('./prisma/dev.db', (err) => {
      if (err) {
        console.error('❌ Error conectando a SQLite:', err);
        reject(err);
        return;
      }
      console.log('✅ Conectado a SQLite');
    });

    async function migrateTables() {
      try {
        console.log('🚀 Iniciando migración de SQLite a PostgreSQL...');

        // Migrar Tenants
        console.log('📋 Migrando Tenants...');
        const tenants = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM tenants', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

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
              isActive: Boolean(tenant.isActive),
              createdAt: new Date(tenant.createdAt),
              updatedAt: new Date(tenant.updatedAt)
            }
          });
        }
        console.log(`✅ Migrados ${tenants.length} tenants`);

        // Migrar Users
        console.log('👥 Migrando Users...');
        const users = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM users', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

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
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          });
        }
        console.log(`✅ Migrados ${users.length} usuarios`);

        // Migrar Services
        console.log('🛎️ Migrando Services...');
        const services = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM services', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

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
              isActive: Boolean(service.isActive),
              createdAt: new Date(service.createdAt),
              updatedAt: new Date(service.updatedAt)
            }
          });
        }
        console.log(`✅ Migrados ${services.length} servicios`);

        // Migrar Professionals
        console.log('👨‍⚕️ Migrando Professionals...');
        const professionals = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM professionals', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

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
              isAvailable: Boolean(professional.isAvailable),
              createdAt: new Date(professional.createdAt),
              updatedAt: new Date(professional.updatedAt)
            }
          });
        }
        console.log(`✅ Migrados ${professionals.length} profesionales`);

        // Migrar Bookings
        console.log('📝 Migrando Bookings...');
        const bookings = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM bookings', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

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
              startDateTime: new Date(booking.startDateTime),
              endDateTime: new Date(booking.endDateTime),
              status: booking.status,
              totalPrice: booking.totalPrice,
              notes: booking.notes,
              createdAt: new Date(booking.createdAt),
              updatedAt: new Date(booking.updatedAt)
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
        
        resolve();

      } catch (error) {
        console.error('❌ Error durante la migración:', error);
        reject(error);
      } finally {
        db.close();
        await postgresClient.$disconnect();
      }
    }

    migrateTables();
  });
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