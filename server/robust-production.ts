import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || "80");

// Basic middleware
app.use(cors());
app.use(express.json());

// Health endpoint that always works
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Basic API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Barbearia SaaS API Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health',
      'GET /api/ping',
      'GET /api'
    ]
  });
});

// Catch all
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'Barbearia SaaS API',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server - NEVER EXIT
console.log('🚀 Starting Robust Barbearia SaaS API...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 Port: ${PORT}`);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Robust API running on port ${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 Ping: http://localhost:${PORT}/api/ping`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log('🟢 Server will never exit - ready for production!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Catch unhandled errors but DON'T EXIT
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.log('⚠️ Server continuing despite error...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('⚠️ Server continuing despite rejection...');
});
