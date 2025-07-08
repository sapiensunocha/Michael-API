const winston = require('winston');

// Create a logger instance using Winston
const logger = winston.createLogger({
  // Set the default logging level. Messages at or below this level will be logged.
  // 'info' means info, warn, and error messages will be captured.
  level: 'info',
  // Define the format of the log messages.
  format: winston.format.combine(
    // Add a timestamp to each log entry
    winston.format.timestamp(),
    // Format the log entry as a JSON object
    winston.format.json()
  ),
  // Define where the logs should be transported (saved or displayed).
  transports: [
    // Transport for error-level messages, saved to 'error.log'
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Transport for all messages (info, warn, error), saved to 'combined.log'
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// In non-production environments (e.g., development), also log to the console.
// This makes it easier to see logs during development without checking files.
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    // Use a simple format for console output for readability
    format: winston.format.simple()
  }));
}

// Export the configured logger instance for use throughout the application
module.exports = logger;
