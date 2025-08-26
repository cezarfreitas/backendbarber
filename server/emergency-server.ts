import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || "80");

// Middleware básico
app.use(cors());
app.use(express.json());

// Health checks que sempre funcionam
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Emergency server running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    server: 'emergency',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    server: 'emergency-mode',
    message: 'Server is running without complex routes',
    uptime: process.uptime()
  });
});

// API básica de teste
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Barbearia API - Emergency Mode',
    version: '1.0.0-emergency',
    status: 'operational',
    note: 'Running in emergency mode due to route parsing issues',
    availableEndpoints: [
      'GET /health',
      'GET /api/ping', 
      'GET /api/status',
      'GET /api'
    ],
    timestamp: new Date().toISOString()
  });
});

// Catch all - sempre responde OK
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'Emergency server is operational',
    path: req.path,
    note: 'Full API routes temporarily disabled due to path-to-regexp error',
    helpUrl: '/api',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Emergency server error:', error);
  res.status(500).json({
    error: 'Emergency server error',
    message: 'Something went wrong in emergency mode',
    timestamp: new Date().toISOString()
  });
});

// Start server
console.log('🚨 Starting EMERGENCY Barbearia API Server...');
console.log(`📡 Port: ${PORT}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log('⚠️  Running in emergency mode due to path-to-regexp errors');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚨 EMERGENCY API running on port ${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 Ping: http://localhost:${PORT}/api/ping`);
  console.log(`🔧 Status: http://localhost:${PORT}/api/status`);
  console.log('⚠️  Complex API routes disabled - emergency mode only');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Emergency server: SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Emergency server: SIGINT received');
  process.exit(0);
});

// Never crash
process.on('uncaughtException', (error) => {
  console.error('Emergency server uncaught exception:', error);
  console.log('⚠️ Continuing despite error...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Emergency server unhandled rejection:', promise, reason);
  console.log('⚠️ Continuing despite rejection...');
});
