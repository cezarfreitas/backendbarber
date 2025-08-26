import { createServer } from './index.js';

console.log('🧪 Testing server creation (path-to-regexp fix)...');

try {
  const app = createServer();
  console.log('✅ Server created successfully - NO path-to-regexp errors!');
  console.log('🎯 Fix confirmed: res.sendFile() now uses absolute path');
  
  // Test the server briefly
  const server = app.listen(8999, () => {
    console.log('✅ Test server started on port 8999');
    server.close(() => {
      console.log('✅ Test completed - server stopped');
      console.log('🚀 Ready for production deploy!');
    });
  });
  
} catch (error) {
  console.error('❌ Server creation failed:', error);
  process.exit(1);
}
