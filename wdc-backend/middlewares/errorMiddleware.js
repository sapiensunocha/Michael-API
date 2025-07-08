const logger = require('../config/logger'); // For logging errors

/**
 * @desc Handles requests to undefined routes (404 Not Found).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const notFound = (req, res, next) => {
  // Create an error object for a not found route
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // Set the response status to 404
  res.status(404);
  // Pass the error to the next middleware (errorHandler)
  next(error);
};

/**
 * @desc General error handling middleware.
 * @param {Object} err - The error object passed from previous middleware.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Determine the status code: if it's a 200-level status (success), change it to 500 (server error)
  // Otherwise, use the existing status code.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Log the error for debugging purposes
  logger.error(`Error: ${err.message}. Stack: ${err.stack}`);

  // Send a JSON response with the error message and stack trace (if in development)
  res.json({
    message: err.message,
    // Only include stack trace in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
