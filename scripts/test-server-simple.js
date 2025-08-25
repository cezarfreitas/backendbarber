// Simple server test to verify the built application works
const http = require('http');

const port = process.env.PORT || 80;

console.log('🔍 Testing server accessibility...');

// Test internal connectivity
const testEndpoint = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

async function runTests() {
  const endpoints = [
    '/api/ping',
    '/api/docs', 
    '/',
    '/api/barbearias'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📍 Testing ${endpoint}...`);
      const result = await testEndpoint(endpoint);
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📄 Response preview: ${result.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }

  console.log('\n🏁 Test completed');
}

runTests();
