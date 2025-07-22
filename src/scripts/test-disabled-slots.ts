// Test script to verify disabled time slots functionality
// This would be run to check that the API returns slots with availability status

import { format, addDays } from 'date-fns';

async function testDisabledSlots() {
  try {
    console.log('🧪 Testing Disabled Time Slots Functionality');
    console.log('===========================================');

    // Test tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = format(tomorrow, 'yyyy-MM-dd');

    console.log(`📅 Testing date: ${formattedDate}`);
    
    // Test 1: Any professional
    console.log('\n📋 Test 1: Any professional available');
    const response1 = await fetch(`http://localhost:3000/api/professionals/available-times?date=${formattedDate}`);
    const result1 = await response1.json();
    
    if (Array.isArray(result1)) {
      console.log(`✅ Found ${result1.length} time slots`);
      result1.forEach((slot: any) => {
        const status = slot.isAvailable ? '✅ Available' : '❌ Occupied';
        console.log(`  ${slot.time} - ${status}${slot.reason ? ` (${slot.reason})` : ''}`);
      });
    } else {
      console.log('❌ Unexpected response format:', result1);
    }

    // Test 2: Specific professional (if available)
    console.log('\n📋 Test 2: Specific professional');
    const response2 = await fetch(`http://localhost:3000/api/professionals/available-times?date=${formattedDate}&professionalId=test-prof-1`);
    const result2 = await response2.json();
    
    if (Array.isArray(result2)) {
      console.log(`✅ Found ${result2.length} time slots for specific professional`);
      result2.forEach((slot: any) => {
        const status = slot.isAvailable ? '✅ Available' : '❌ Occupied';
        console.log(`  ${slot.time} - ${status}${slot.reason ? ` (${slot.reason})` : ''}`);
      });
    } else {
      console.log('❌ Unexpected response format:', result2);
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('✅ Expected behavior:');
    console.log('  - All working hours should be shown');
    console.log('  - Occupied slots should have isAvailable: false');
    console.log('  - Available slots should have isAvailable: true');
    console.log('  - Occupied slots should include reason: "Reservado"');

  } catch (error) {
    console.error('❌ Error testing disabled slots:', error);
    console.log('\n💡 Make sure the development server is running on localhost:3000');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testDisabledSlots();
}

export { testDisabledSlots };