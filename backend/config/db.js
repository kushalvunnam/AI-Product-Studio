const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/productstudio';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit process in hackathon if DB fails, allow fallback or manual restart
  }
};

module.exports = connectDB;
