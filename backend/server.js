const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const routes = require('./routes/index');
const mongoose = require('mongoose');
const cors = require('cors');
const { corsOptions } = require('./utils/cors.utils');
const cookieParser = require('cookie-parser');
const tenantMiddleware = require('./middlewares/tenant.middleware');

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', routes);

app.get('/health-check', (req, res) => {
  res.send('API is running....');
});

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  console.log('Received shutdown signal, starting graceful shutdown...');

  try {
    await new Promise((resolve) => {
      server.close(resolve);
    });
    console.log('HTTP server closed');

    await mongoose.connection.close();
    console.log('Database connection closed');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}
