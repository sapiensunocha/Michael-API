const logger = require('../config/logger');

const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  const path = req.path; // Get the current request path

  // Logic for /register route
  if (path === '/register') {
    if (!name || !email || !password) {
      logger.warn('Missing required fields for registration: name, email, or password');
      return res.status(400).json({ message: 'Missing required fields for registration' });
    }
  }
  // Logic for /login route
  else if (path === '/login') {
    if (!email || !password) {
      logger.warn('Missing required fields for login: email or password');
      return res.status(400).json({ message: 'Missing required fields for login' });
    }
  }
  // If the middleware is applied to other routes, they would pass through
  // or you could add more specific validation here.
  
  next(); // Proceed to the next middleware or controller
};

module.exports = { validateUser };
