// Define your backend API base URL
// In development, this will typically be your localhost backend server.
// In production, this will be your deployed backend URL (e.g., Render URL).
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000/api';

/**
 * Helper function to make authenticated API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/users/login').
 * @param {string} method - The HTTP method (e.g., 'POST', 'GET').
 * @param {Object} [body] - The request body for POST/PUT requests.
 * @param {string} [token] - The JWT token for authenticated requests.
 * @returns {Promise<Object>} The JSON response from the API.
 * @throws {Error} If the API call fails or returns an error status.
 */
const apiRequest = async (endpoint, method, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }), // Only add body if it exists
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response as JSON first
    const data = await response.json();

    // If the response was not successful (e.g., 4xx, 5xx), throw an error
    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Something went wrong';
      throw new Error(errorMessage);
    }

    return data; // Return the successful data

  } catch (error) {
    console.error(`API Request Error [${method} ${endpoint}]:`, error);
    throw error; // Re-throw the error for the calling component to handle
  }
};

/**
 * @desc Calls the backend login endpoint.
 * @param {Object} credentials - Object containing email and password.
 * @returns {Promise<Object>} User data including token, id, name, email, api_key, plan_name, status.
 */
export const loginUser = async (credentials) => {
  return apiRequest('/users/login', 'POST', credentials);
};

/**
 * @desc Calls the backend registration endpoint.
 * @param {Object} userData - Object containing name, email, and password.
 * @returns {Promise<Object>} User data including token, id, name, email, api_key.
 */
export const registerUser = async (userData) => {
  return apiRequest('/users/register', 'POST', userData);
};

/**
 * @desc Fetches the authenticated partner's profile from the backend.
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<Object>} Partner data.
 */
export const getPartnerProfile = async (token) => {
  return apiRequest('/partners/profile', 'GET', null, token);
};

/**
 * @desc Fetches all available subscription plans from the backend.
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<Array<Object>>} An array of plan objects.
 */
export const getPlans = async (token) => {
  return apiRequest('/payments/plans', 'GET', null, token);
};

/**
 * @desc Creates a Stripe Checkout Session for a subscription plan.
 * @param {string} token - The JWT token of the authenticated user.
 * @param {string} planId - The ID of the selected plan (e.g., 'basic', 'pro').
 * @param {string} successUrl - URL for successful payment redirect.
 * @param {string} cancelUrl - URL for cancelled payment redirect.
 * @returns {Promise<Object>} Object containing the Stripe checkout session URL.
 */
export const createCheckoutSession = async (token, planId, successUrl, cancelUrl) => {
  const body = {
    planId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  };
  return apiRequest('/payments/create-session', 'POST', body, token);
};

/**
 * @desc Fetches global dashboard summary data (key numbers, active alerts).
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<Object>} Object containing globalSummary and activeAlerts.
 */
export const getGlobalDashboardData = async (token) => {
  return apiRequest('/partners/dashboard/global-summary', 'GET', null, token);
};

/**
 * @desc Fetches trending insights for the dashboard preview.
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<Array<Object>>} An array of insight objects.
 */
export const getTrendingInsights = async (token) => {
  return apiRequest('/partners/dashboard/trending-insights', 'GET', null, token);
};

// You can add more API functions here as your application grows
// e.g., for updating partner plan, fetching usage logs, etc.
