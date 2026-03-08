require('dotenv').config();

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';

const app = createApp();

app
  .listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  })
  .on('error', (err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
