import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables (.env locally, or production variables on Render/Heroku)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigin = (process.env.CORS_ORIGIN || '*').trim();
const allowedOrigins = corsOrigin === '*'
  ? ['*']
  : corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server and native requests that may not send an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS policy: origin not allowed'));
  },
};

// Security Middleware: Helmet injects HSTS effectively preventing Man-in-the-Middle payloads
app.use(helmet()); 

// Middleware
app.use(cors(corsOptions)); // Allow cross-origin requests from the React/Capacitor frontend
app.use(express.json()); // Parse incoming JSON payloads natively

// Security Middleware: Rate Limit Brute Force Protection (100 req per 15min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// Mount Route Controllers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Root path & Health Check API
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: 'AdiPay API is running stably.',
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, message: 'Endpoint Not Found' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[AdiPay Server]: Backend API is actively listening on port ${PORT}`);
});
