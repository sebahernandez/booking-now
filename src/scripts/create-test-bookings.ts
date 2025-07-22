import { PrismaClient, BookingStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBookings() {
  try {
    console.log('Creating test bookings...');

    // First, let's find or create a test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test Cliente',
          phone: '+1234567890',
          role: UserRole.CLIENT,
        }
      });
    }

    // Find the first service and professional
    const service = await prisma.service.findFirst();
    const professional = await prisma.professional.findFirst();

    if (!service || !professional) {
      console.log('No service or professional found. Please create them first.');
      return;
    }

    console.log(`Found service: ${service.name} (${service.duration}min)`);
    console.log(`Found professional: ${professional.id}`);

    // Create test bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM

    const booking1StartTime = new Date(tomorrow);
    const booking1EndTime = new Date(booking1StartTime);
    booking1EndTime.setMinutes(booking1EndTime.getMinutes() + service.duration);

    const booking2StartTime = new Date(tomorrow);
    booking2StartTime.setHours(14, 30, 0, 0); // 2:30 PM
    const booking2EndTime = new Date(booking2StartTime);
    booking2EndTime.setMinutes(booking2EndTime.getMinutes() + service.duration);

    // Create bookings
    const booking1 = await prisma.booking.create({
      data: {
        clientId: testUser.id,
        professionalId: professional.id,
        serviceId: service.id,
        startDateTime: booking1StartTime,
        endDateTime: booking1EndTime,
        totalPrice: service.price,
        status: BookingStatus.CONFIRMED,
        notes: 'Test booking 1 - should block 10:00 slot'
      }
    });

    const booking2 = await prisma.booking.create({
      data: {
        clientId: testUser.id,
        professionalId: professional.id,
        serviceId: service.id,
        startDateTime: booking2StartTime,
        endDateTime: booking2EndTime,
        totalPrice: service.price,
        status: BookingStatus.PENDING,
        notes: 'Test booking 2 - should block 14:30 slot'
      }
    });

    console.log('✅ Test bookings created successfully!');
    console.log(`Booking 1: ${booking1StartTime.toLocaleString()} - ${booking1EndTime.toLocaleString()} (CONFIRMED)`);
    console.log(`Booking 2: ${booking2StartTime.toLocaleString()} - ${booking2EndTime.toLocaleString()} (PENDING)`);
    console.log('\nThese time slots should now be unavailable in the booking form.');

  } catch (error) {
    console.error('Error creating test bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBookings();