const { PrismaClient } = require('@prisma/client');

// Simulate email function for testing since we can't import TypeScript modules directly
async function sendTestEmail(bookingData) {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://booking-now.vercel.app'
    : 'http://localhost:3000';
    
  try {
    const response = await fetch(`${apiUrl}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingData })
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.log('Direct API call failed, will create booking via API instead');
    return { success: false, error: error.message };
  }
}

const prisma = new PrismaClient();

async function createTestBookingAndSendEmail() {
  try {
    console.log('📅 Starting test booking creation and email sending...');
    
    // Get the first available tenant, service, and professional
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          take: 1
        },
        professionals: {
          where: { isAvailable: true },
          include: {
            user: true
          },
          take: 1
        }
      }
    });

    if (!tenant || !tenant.services[0]) {
      console.error('❌ No active tenant or services found');
      return;
    }

    const service = tenant.services[0];
    const professional = tenant.professionals[0];

    console.log(`✅ Found tenant: ${tenant.name}`);
    console.log(`✅ Found service: ${service.name}`);
    console.log(`✅ Found professional: ${professional?.user.name || 'None'}`);

    // Check if client already exists
    let client = await prisma.user.findUnique({
      where: { email: 'sebaprogramer@gmail.com' }
    });

    if (!client) {
      console.log('👤 Creating new client...');
      client = await prisma.user.create({
        data: {
          email: 'sebaprogramer@gmail.com',
          name: 'Sebastian Test User',
          phone: '+57 300 123 4567',
          role: 'CLIENT',
          tenantId: tenant.id
        }
      });
    }

    // Create booking
    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() + 1); // Tomorrow
    startDateTime.setHours(10, 0, 0, 0); // 10:00 AM

    const endDateTime = new Date(startDateTime.getTime() + (service.duration * 60 * 1000));

    console.log('📝 Creating booking...');
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        professionalId: professional?.id || null,
        serviceId: service.id,
        tenantId: tenant.id,
        startDateTime,
        endDateTime,
        totalPrice: service.price,
        notes: 'Test booking created for email verification',
        status: 'CONFIRMED'
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        },
        professional: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        tenant: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    console.log(`✅ Booking created with ID: ${booking.id}`);

    // Prepare booking data for email
    const bookingEmailData = {
      id: booking.id,
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      clientPhone: booking.client.phone,
      date: booking.startDateTime,
      startTime: booking.startDateTime.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      endTime: booking.endDateTime.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      service: {
        name: booking.service.name,
        duration: booking.service.duration,
        price: booking.service.price
      },
      professional: {
        name: booking.professional?.user.name || 'Sin asignar',
        email: booking.professional?.user.email
      },
      tenant: {
        name: booking.tenant.name,
        email: booking.tenant.email,
        phone: booking.tenant.phone
      },
      notes: booking.notes
    };

    console.log('📧 Booking created in database. For email testing, we need to use the API endpoint.');
    console.log('📧 Email will be sent when booking is created via API.');
    console.log('📧 Recipient would be:', bookingEmailData.clientEmail);
    console.log('📧 Subject would be: Confirmación de Reserva #' + booking.id + ' - ' + service.name);

    console.log('\n📋 Booking Summary:');
    console.log('==================');
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Client: ${bookingEmailData.clientName} (${bookingEmailData.clientEmail})`);
    console.log(`Service: ${bookingEmailData.service.name}`);
    console.log(`Professional: ${bookingEmailData.professional.name}`);
    console.log(`Date: ${booking.startDateTime.toLocaleDateString('es-CO')}`);
    console.log(`Time: ${bookingEmailData.startTime} - ${bookingEmailData.endTime}`);
    console.log(`Price: $${bookingEmailData.service.price.toLocaleString('es-CO')}`);
    console.log(`Tenant: ${bookingEmailData.tenant.name}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
createTestBookingAndSendEmail();