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
// 1. Parse incoming JSON request bodies
app.use(express.json());

// 2. Attach a unique request ID to every request
app.use(requestId);

// 3. Serve interactive web dashboard from public directory
app.use(express.static(path.join(__dirname, '../public')));

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

// ─── Routes ─────────────────────────────────────────────
app.use('/students', studentRoutes);

// ─── 404 Fallback for Unknown Routes ────────────────────
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// ─── Global Error Handler (from express-error-kit) ──────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Student Management Portal running on http://localhost:${PORT}`);
  });
}

module.exports = app;
