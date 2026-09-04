const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDB } = require('./config/db');
const registerTrackingSockets = require('./sockets/trackingSocket');

const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const tripRoutes = require('./routes/trips');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// CORS configuration for local development and clients
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RideSense AI Tracking Engine',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO tracking logic registration
registerTrackingSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 RideSense AI Server listening on port ${PORT}`);
  console.log(`📡 Socket.IO Real-time Gateway Ready`);
  console.log(`====================================================`);
});
