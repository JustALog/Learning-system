const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (development) ───
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── API Routes ───
app.use('/api', routes);

// ─── Root ───
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Web Quản Lý & Đăng Ký Học Phần - API Server',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

module.exports = app;
