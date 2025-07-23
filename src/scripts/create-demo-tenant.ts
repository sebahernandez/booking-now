import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating demo tenant...');

  try {
    // Create demo tenant
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const demoTenant = await prisma.tenant.create({
      data: {
        name: 'Clínica Dental Demo',
        email: 'demo@dental.com',
        password: hashedPassword,
        phone: '+56 9 8765 4321',
        isActive: true,
      },
    });

    console.log('✅ Demo tenant created:');
    console.log('  Email:', demoTenant.email);
    console.log('  Password: demo123');
    console.log('  Name:', demoTenant.name);

    // Create some services for the demo tenant
    const consultaService = await prisma.service.create({
      data: {
        name: 'Consulta Dental',
        description: 'Consulta general y revisión dental',
        duration: 30,
        price: 25000,
        tenantId: demoTenant.id,
      },
    });

    const limpiezaService = await prisma.service.create({
      data: {
        name: 'Limpieza Dental',
        description: 'Profilaxis y limpieza profesional',
        duration: 45,
        price: 35000,
        tenantId: demoTenant.id,
      },
    });

    console.log('✅ Demo services created:');
    console.log('  -', consultaService.name);
    console.log('  -', limpiezaService.name);

    // Create a demo professional for this tenant
    const profPassword = await bcrypt.hash('prof123', 12);
    
    const profUser = await prisma.user.create({
      data: {
        email: 'dr.martinez@dental.com',
        name: 'Dr. Carlos Martínez',
        phone: '+56 9 1111 2222',
        password: profPassword,
        role: 'PROFESSIONAL',
        tenantId: demoTenant.id,
      },
    });

    const professional = await prisma.professional.create({
      data: {
        userId: profUser.id,
        tenantId: demoTenant.id,
        bio: 'Dentista especialista con 15 años de experiencia',
        hourlyRate: 50000,
        isAvailable: true,
      },
    });

    console.log('✅ Demo professional created:');
    console.log('  Email:', profUser.email);
    console.log('  Password: prof123');
    console.log('  Name:', profUser.name);

    // Link professional to services
    await prisma.professionalService.createMany({
      data: [
        { professionalId: professional.id, serviceId: consultaService.id },
        { professionalId: professional.id, serviceId: limpiezaService.id },
      ],
    });

    // Create availability slots
    const workDays = [1, 2, 3, 4, 5]; // Monday to Friday
    
    for (const dayOfWeek of workDays) {
      // Morning block
      await prisma.availabilitySlot.create({
        data: {
          professionalId: professional.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '12:00',
        },
      });

      // Afternoon block
      const endTime = dayOfWeek === 5 ? '17:00' : '18:00';
      await prisma.availabilitySlot.create({
        data: {
          professionalId: professional.id,
          dayOfWeek,
          startTime: '14:00',
          endTime,
        },
      });
    }

    console.log('✅ Availability slots created for the professional');
    console.log('');
    console.log('🎉 Demo tenant setup complete!');
    console.log('');
    console.log('How to test:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Login as tenant:');
    console.log('   - Email: demo@dental.com');
    console.log('   - Password: demo123');
    console.log('3. You should see only this tenant\'s data');
    console.log('4. The "Clientes" menu should be hidden for tenant users');
    console.log('');
    console.log('Or login as admin:');
    console.log('   - Email: admin@booking-now.com');
    console.log('   - Password: admin123');
    console.log('   - You should see all tenants and can manage them');

  } catch (error) {
    console.error('Error creating demo tenant:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });