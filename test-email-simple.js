const fetch = require('node-fetch');

async function testEmail() {
  try {
    const testDate = new Date('2025-08-12T10:00:00.000Z');
    
    const testBookingData = {
      id: 'test-123',
      clientName: 'Sebastian Test',
      clientEmail: 'info@datapro.cl',
      clientPhone: '+57 300 123 4567',
      date: testDate.toISOString(), // Send as ISO string
      startTime: '10:00',
      endTime: '11:00',
      service: {
        name: 'Photography Session',
        duration: 60,
        price: 150
      },
      professional: {
        name: 'John Smith',
        email: 'john@test.com'
      },
      tenant: {
        name: 'Demo Photography Studio',
        email: 'info@datapro.cl',
        phone: '+1234567890'
      },
      notes: 'Direct API email test with proper date'
    };

    console.log('📧 Testing email with date:', testDate.toISOString());
    
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingData: testBookingData })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email Test SUCCESS!');
      console.log('📧 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Email Test FAILED:');
      console.log('📧 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testEmail();