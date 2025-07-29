const http = require('http');
const querystring = require('querystring');

// First, let's test the signin endpoint with form data
const postData = querystring.stringify({
  email: 'admin@booking-now.com',
  password: 'admin123',
  callbackUrl: 'http://localhost:3000/admin'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/signin/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔄 Testing NextAuth signin endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response length:', data.length);
    console.log('Response preview:', data.substring(0, 500));
    
    // Check if it's a redirect
    if (res.statusCode === 302) {
      console.log('Redirect to:', res.headers.location);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
});

req.write(postData);
req.end();