const jwt = require('jsonwebtoken'); // For verifying JWT tokens
const dotenv = require('dotenv'); // For accessing environment variables
const supabase = require('../config/supabaseClient'); // For fetching user data from Supabase
const logger = require('../config/logger'); // For logging errors and warnings

dotenv.config(); // Load environment variables

/**
 * @desc Protects routes by verifying JWT token.
 * Attaches the authenticated user's ID to req.user.id.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from Supabase using the ID from the token
      // We select only the 'id' to avoid sending sensitive data downstream
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        logger.error(`User not found for token ID: ${decoded.id}. Error: ${error ? error.message : 'No user data.'}`);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach the user ID to the request object, so it's available in subsequent middleware/controllers
      req.user = { id: user.id };
      next(); // Proceed to the next middleware or route handler

    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header
  if (!token) {
    logger.warn('No token found in authorization header.');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc Middleware to check if the authenticated user is an admin.
 * (Requires 'protect' middleware to run first to attach req.user.id)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const admin = async (req, res, next) => {
  // Assuming the user's role is stored in the 'users' table or 'partners' table.
  // For this example, let's assume a 'role' column in the 'users' table.
  // You might need to adjust this based on where you store user roles.

  if (!req.user || !req.user.id) {
    logger.warn('Admin check failed: User ID not found on request. Is protect middleware running first?');
    return res.status(401).json({ message: 'Not authorized as an admin: User not authenticated.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role') // Assuming a 'role' column exists in your 'users' table
      .eq('id', req.user.id)
      .single();

    if (error || !user || user.role !== 'admin') {
      logger.warn(`Admin check failed for user ID: ${req.user.id}. Role: ${user ? user.role : 'N/A'}`);
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    next(); // User is an admin, proceed

  } catch (err) {
    logger.error(`Error during admin role check for user ID ${req.user.id}: ${err.message}`);
    res.status(500).json({ message: 'Server error during authorization check' });
  }
};

module.exports = { protect, admin };