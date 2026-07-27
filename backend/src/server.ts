import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import alertsRoutes from './routes/alerts.routes';
import incidentsRoutes from './routes/incidents.routes';
import agentsRoutes from './routes/agents.routes';
import eventsRoutes from './routes/events.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import usersRoutes from './routes/users.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'sentinelx-backend',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info('SentinelX Backend running on port ' + PORT);
  logger.info('Health check: http://localhost:' + PORT + '/health');
  logger.info('Auth endpoint: http://localhost:' + PORT + '/api/auth');
  logger.info('Dashboard endpoint: http://localhost:' + PORT + '/api/dashboard');
  logger.info('Alerts endpoint: http://localhost:' + PORT + '/api/alerts');
  logger.info('Incidents endpoint: http://localhost:' + PORT + '/api/incidents');
  logger.info('Agents endpoint: http://localhost:' + PORT + '/api/agents');
  logger.info('Events endpoint: http://localhost:' + PORT + '/api/events');
});

export default app;