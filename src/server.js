require('dotenv').config();

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;

const app = createApp();

app
  .listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  })
  .on('error', (err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
