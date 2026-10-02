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
  origin: function (origin, callback) {
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
      : ['http://localhost:5173'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Also check if any allowed origin is a substring to handle Vercel preview domains gracefully
      const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes(origin) || origin.endsWith('.vercel.app'));
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProductStudio AI API is running' });
});

app.get('/api/groq-models', async (req, res) => {
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await groqRes.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
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
