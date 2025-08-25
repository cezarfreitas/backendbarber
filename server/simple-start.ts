import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 80;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check that always works
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Catch all route
app.get('*', (req, res) => {
  res.status(200).json({ 
    message: 'Barbearia SaaS API Running',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple API running on port ${PORT}`);
  console.log(`🔧 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 Ping: http://localhost:${PORT}/api/ping`);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
