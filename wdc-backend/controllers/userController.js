const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient'); // Corrected path
const generateToken = require('../utils/generateToken'); // Corrected path
const logger = require('../config/logger'); // Corrected path
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique API keys

/**
 * @desc Registers a new user and creates a corresponding partner entry.
 * @route POST /api/users/register
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing name, email, and password.
 * @param {string} req.body.name - The user's name.
 * @param {string} req.body.email - The user's email (must be unique).
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The response object.
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation for registration fields
  if (!name || !email || !password) {
    logger.warn('Missing required fields for registration.');
    return res.status(400).json({ error: 'Missing required fields: name, email, and password.' });
  }

  try {
    // 1. Hash the user's password for security
    const hashed = await bcrypt.hash(password, 10);

    // 2. Insert the new user into the 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ name, email, password: hashed }])
      .select('id, name, email'); // Select necessary fields including the generated ID

    if (userError) {
      logger.error(`User registration error: ${userError.message}`);
      // Check for unique constraint violation (e.g., email already exists)
      if (userError.code === '23505') { // PostgreSQL unique violation error code
        return res.status(409).json({ error: 'Email already registered. Please use a different email.' });
      }
      return res.status(400).json({ error: userError.message });
    }

    const userId = userData[0].id;
    const userName = userData[0].name;
    const userEmail = userData[0].email;

    // 3. Generate a unique API key for the new partner
    const apiKey = uuidv4();

    // 4. Create a corresponding entry in the 'partners' table
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .insert([
        {
          user_id: userId, // Link to the user's ID
          name: userName,
          contact_email: userEmail,
          api_key: apiKey,
          plan_name: 'free', // Default to 'free' plan upon registration
          status: 'active', // Default status
        },
      ])
      .select(); // Select to confirm insertion

    if (partnerError) {
      logger.error(`Partner creation error after user registration: ${partnerError.message}. User ID: ${userId}`);
      // Optionally, you might want to roll back the user creation if partner creation fails
      // However, for simplicity here, we log and return an an error.
      return res.status(500).json({ error: 'Failed to create partner account. Please try again.' });
    }

    // 5. Generate a JWT token for the newly registered user
    const token = generateToken(userId);

    // 6. Respond with user details, token, and the generated API key
    res.status(201).json({
      id: userId,
      name: userName,
      email: userEmail,
      api_key: apiKey, // Return the API key to the user
      plan_name: 'free', // Return the default plan
      status: 'active', // Return the default status
      token: token,
    });

  } catch (err) {
    logger.error(`Unexpected error during user registration: ${err.message}`);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * @desc Authenticates a user and provides a JWT token.
 * @route POST /api/users/login
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing email and password.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The response object.
 */
const loginUser = async (req, res) => {
  console.log('Received login request body:', req.body); // ADDED FOR DEBUGGING
  const { email, password } = req.body;

  // Add explicit validation for login fields
  if (!email || !password) {
    logger.warn('Missing required fields for login.');
    return res.status(400).json({ error: 'Missing required fields: email and password.' });
  }

  try {
    // 1. Fetch the user from the 'users' table by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email, password') // Select password to compare
      .eq('email', email)
      .single();

    if (userError || !userData) {
      logger.warn(`Login attempt failed for ${email}: User not found or DB error.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      logger.warn(`Login attempt failed for ${email}: Incorrect password.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Fetch the partner's API key and plan details from the 'partners' table
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('api_key, plan_name, status')
      .eq('user_id', userData.id)
      .single();

    if (partnerError || !partnerData) {
      logger.error(`Partner data not found for user ID: ${userData.id}. Error: ${partnerError ? partnerError.message : 'No partner entry.'}`);
      // This case should ideally not happen if registration is successful, but handle it.
      return res.status(500).json({ error: 'Failed to retrieve partner information.' });
    }

    // 4. Generate a JWT token for the authenticated user
    const token = generateToken(userData.id);

    // 5. Respond with user details, token, and partner-specific information
    res.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      api_key: partnerData.api_key, // Return the API key
      plan_name: partnerData.plan_name, // Return the current plan
      status: partnerData.status, // Return the partner status
      token: token,
    });

  } catch (err) {
    logger.error(`Unexpected error during user login: ${err.message}`);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { registerUser, loginUser };
