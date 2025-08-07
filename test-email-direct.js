// Test email functionality directly
const testBookingData = {
  id: 'test-123',
  clientName: 'Sebastian Test',
  clientEmail: 'info@datapro.cl', // Use verified email
  clientPhone: '+57 300 123 4567',
  date: new Date('2025-08-12T10:00:00.000Z'),
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
    email: 'info@datapro.cl', // Use verified email for tenant too
    phone: '+1234567890'
  },
  notes: 'Direct API email test'
};

fetch('http://localhost:3000/api/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ bookingData: testBookingData })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Email API Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ Email API Error:', error);
});