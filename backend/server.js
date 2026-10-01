const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProductStudio AI API is running' });
});

// Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/vision', require('./routes/visionRoutes'));
app.use('/api/generation', require('./routes/generationRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
