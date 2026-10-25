require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Ensure upload folders exist on startup
const uploadsDir = path.join(__dirname, 'uploads');
['images', 'pdfs', 'temp'].forEach((sub) => {
  const dir = path.join(uploadsDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middlewares
app.use(cors({
  credentials: true,
  origin: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files statically (images and pdfs)
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint for Dokploy / Docker monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Soloshine Backend API',
    status: 'running',
    version: '1.0.0'
  });
});

// Application Routes
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/category', categoryRoutes);
app.use('/dashboard', dashboardRoutes);

// Server Listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Database Connection
main()
  .then(() => console.log('Connected to MongoDB database'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function main() {
  if (!process.env.DATA_BASE_URL) {
    console.warn('WARNING: DATA_BASE_URL is not set in environment variables!');
  }
  await mongoose.connect(process.env.DATA_BASE_URL);
}