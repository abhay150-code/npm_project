'use strict';

const path = require('path');
const express = require('express');
const {
  AppError,
  NotFoundError,
  requestId,
  errorHandler
} = require('@abhay150/express-error-kit');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────
// 1. CORS headers (enables frontend-backend connectivity across any domain)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 2. Parse incoming JSON request bodies
app.use(express.json());

// 3. Attach a unique request ID to every request via express-error-kit
app.use(requestId);

// 4. Serve interactive web frontend from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ─── Explicit Frontend Route ─────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Health Check Endpoint ──────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    requestId: req.requestId
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use('/students', studentRoutes);

// ─── 404 Fallback for Unknown Routes ────────────────────
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// ─── Global Error Handler (from express-error-kit) ──────
app.use(errorHandler);

// ─── Start Server (Local / Standalone) ───────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Student Management Portal running on http://localhost:${PORT}`);
  });
}

module.exports = app;
