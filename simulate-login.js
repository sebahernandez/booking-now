const { default: fetch } = require('node-fetch');

async function simulateLogin() {
  try {
    console.log('🔄 Simulating frontend login process...');
    
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // Step 2: Attempt signin
    console.log('2️⃣ Attempting signin...');
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@booking-now.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: 'http://localhost:3000/admin',
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    console.log('Signin Status:', signinResponse.status);
    console.log('Signin Headers:', signinResponse.headers.raw());
    
    const signinText = await signinResponse.text();
    console.log('Signin Response:', signinText);
    
    // Step 3: Check if we're redirected to success page
    if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location');
      console.log('Redirected to:', location);
      
      if (location && !location.includes('error')) {
        console.log('✅ Login appears successful!');
      } else {
        console.log('❌ Login failed - redirected to error page');
      }
    }
    
  } catch (error) {
    console.error('❌ Simulation error:', error);
  }
}

simulateLogin();