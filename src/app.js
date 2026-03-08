const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/order', orderRoutes);

  return app;
}

module.exports = { createApp };
