/* eslint-disable no-undef */
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const database = require('./config/database');
const cors = require('./plugins/cors');
const rateLimit = require('./plugins/rate-limiter');
const app = express();
const path = require('path');
const logger = require('./config/logger');
const routesV1 = require('./routes/v1/');
const welcome = require('./routes/welcome.routes');
const responseInterceptor = require('./middleware/response.mw');
const config = require('./config');
// start database connection
database
  .$connect()
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1); // Exit the process if database connection fails
  })
  .finally(() => {
    logger.info('Database connection attempt finished');
  });
// Set up global error handler
app.use((req, res, next, err) => {
  logger.error(`Global Error Handler: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

if (config.env === 'development') {
  console.log = (...args) => logger.info(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  console.warn = (...args) => logger.warn(args.join(' '));
}
// Set up global request logging

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(responseInterceptor);

app.use(express.urlencoded({ extended: true }));
// Rate limiting
app.use(rateLimit);
// Logging
app.use(morgan('combined', { stream: logger.stream }));
// Serve static files

app.use('/static', express.static(path.join(__dirname, '../uploads')));
// Routes
app.use('/api/v1', routesV1);
app.use('/', welcome);
// export app

module.exports = app;
