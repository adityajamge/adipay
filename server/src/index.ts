import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables (.env locally, or production variables on Render/Heroku)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from the React/Capacitor frontend
app.use(express.json()); // Parse incoming JSON payloads natively

// Mount Route Controllers
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Root path & Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AdiPay API is running stably.',
    timestamp: new Date().toISOString()
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint Not Found' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[AdiPay Server]: Backend API is actively listening on port ${PORT}`);
});
