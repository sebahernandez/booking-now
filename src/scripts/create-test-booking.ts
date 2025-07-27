import { PrismaClient } from '@prisma/client';
import { addDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    console.log('🧪 Creating test booking...');

    // Get a demo tenant and service
    const tenant = await prisma.tenant.findFirst();
    const service = await prisma.service.findFirst({ 
      where: { tenantId: tenant?.id } 
    });

    if (!tenant || !service) {
      console.log('❌ No tenant or service found. Please run seed first.');
      return;
    }

    // Get or create a demo client
    let client = await prisma.user.findUnique({
      where: { email: 'demo-client@test.com' }
    });

    if (!client) {
      client = await prisma.user.create({
        data: {
          name: 'Demo Client',
          email: 'demo-client@test.com',
          role: 'CLIENT',
        }
      });
    }

    // Create a booking for tomorrow at 10:00 AM
    const tomorrow = addDays(new Date(), 1);
    const bookingDateTime = new Date(tomorrow);
    bookingDateTime.setHours(10, 0, 0, 0);
    
    const endDateTime = addHours(bookingDateTime, service.duration / 60);

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        tenantId: tenant.id,
        startDateTime: bookingDateTime,
        endDateTime: endDateTime,
        status: 'CONFIRMED',
        totalPrice: service.price,
        notes: 'Test booking created by script',
      },
    });

    console.log('✅ Test booking created successfully!');
    console.log(`📅 Date: ${bookingDateTime.toISOString()}`);
    console.log(`👤 Client: ${client.name} (${client.email})`);
    console.log(`🛍️ Service: ${service.name}`);
    console.log(`💰 Price: $${service.price}`);
    console.log(`🆔 Booking ID: ${booking.id}`);

  } catch (error) {
    console.error('❌ Error creating test booking:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestBooking().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { createTestBooking };