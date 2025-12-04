// server/server.js
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import config from './config/index.js';

const app = createApp();
const PORT = config.port;
const HOST = '0.0.0.0';

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      console.log(`Listening on ${HOST}:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server listen error:', err);
    });
  } catch (err) {
    console.error('Startup error (DB connection failed):', err);
    process.exit(1);
  }
}

start();
