// frontend/src/api/backendApi.js
import { supabase } from '../lib/supabaseClient'; // Import your Supabase client instance

/**
 * @desc Handles user login using Supabase Auth.
 * @param {Object} credentials - Object containing email and password.
 * @returns {Promise<Object>} User data including session and enriched user object.
 */
export const loginUser = async (credentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    console.error('Supabase Login Error:', error);
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }

  // NEW: Fetch the complete partner profile after successful authentication
  const partnerProfile = await getPartnerProfile();
  const enrichedUser = partnerProfile ? { ...data.user, ...partnerProfile } : data.user;

  return {
    token: data.session?.access_token,
    user: enrichedUser,
  };
};

/**
 * @desc Handles user registration using Supabase Auth.
 * @param {Object} userData - Object containing name, email, and password.
 * @returns {Promise<Object>} User data including session and enriched user object.
 */
export const registerUser = async (userData) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
      },
    },
  });

  if (error) {
    console.error('Supabase Registration Error:', error);
    throw new Error(error.message || 'Registration failed. User might already exist or email confirmation is required.');
  }

  // NEW: Fetch the complete partner profile after successful registration
  const partnerProfile = await getPartnerProfile();
  const enrichedUser = partnerProfile ? { ...data.user, ...partnerProfile } : data.user;

  return {
    token: data.session?.access_token,
    user: enrichedUser,
  };
};

/**
 * @desc Sends a password reset email using Supabase Auth.
 * @param {string} email - The email address to send the reset link to.
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error('Supabase Password Reset Error:', error);
    throw new Error(error.message || 'Failed to send password reset email.');
  }
};

/**
 * @desc Fetches the authenticated partner's profile, their API key, and their subscriptions from Supabase.
 * @returns {Promise<Object|null>} Partner data including profile, API key, and subscriptions, or null if not found.
 */
export const getPartnerProfile = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Auth error in getPartnerProfile:', authError);
    return null; // Return null if no authenticated user
  }

  // 1. Fetch user_profiles data
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Supabase Profile Fetch Error:', profileError);
    // Don't throw here; allow other data to be fetched if profile has issues
    return null; // If profile fetching fails, return null
  }

  // 2. Fetch API key data from api_keys table separately
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('api_key, plan, status') // Select relevant fields for the API key
    .eq('user_id', user.id) // Link using the user_id column
    .maybeSingle();

  if (apiKeyError) {
    console.error('Supabase API Key Fetch Error:', apiKeyError);
    // Log the error but don't stop the function if the API key isn't found
  }

  // 3. Fetch user_subscriptions data separately
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('user_subscriptions')
    .select('*') // Fetch all columns from user_subscriptions
    .eq('user_id', user.id); // Link user_id in subscriptions to auth.users.id

  if (subscriptionsError) {
    console.error('Supabase Subscriptions Fetch Error:', subscriptionsError);
    // Log the error but don't stop the function if subscriptions aren't found
  }

  // Combine all fetched data into a single profile object
  const finalProfile = {
      ...(profile || {}), // Ensure profile is an object even if it was null from its fetch
      api_key: apiKeyData ? apiKeyData.api_key : null, // Add api_key to the top level
      api_plan: apiKeyData ? apiKeyData.plan : null,   // Add api_plan
      api_status: apiKeyData ? apiKeyData.status : null, // Add api_status
      user_subscriptions: subscriptions || [], // Ensure subscriptions is an array
  };

  return finalProfile;
};

/**
 * @desc Fetches all available subscription plans from the Supabase Edge Function.
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<Array<Object>>}
 */
export const getPlans = async (token) => {
  const { data, error } = await supabase.functions.invoke('get-plans', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error('Supabase Edge Function Error [get-plans]:', error);
    throw new Error(data?.error || 'Failed to retrieve plans from Edge Function.');
  }
  return data;
};

/**
 * @desc Creates a Stripe Checkout Session using the Supabase Edge Function.
 * @param {string} token - The JWT token of the authenticated user.
 * @param {string} planId - The ID of the selected plan.
 * @param {string} successUrl - URL for successful payment redirect.
 * @param {string} cancelUrl - URL for cancelled payment redirect.
 * @param {string} [name] - Optional user name for Stripe display.
 * @returns {Promise<Object>}
 */
export const createCheckoutSession = async (token, planId, successUrl, cancelUrl, name) => {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      planId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      name, // Added optional name parameter
    }),
  });

  if (error) {
    console.error('Supabase Edge Function Error [create-checkout-session]:', error);
    console.error('Backend error details:', data);
    throw new Error(data?.error || 'Failed to create checkout session. Please try again.');
  }
  return data;
};

/**
 * @desc Fetches global dashboard summary data and active alerts from Supabase.
 * @returns {Promise<Object>} Object containing globalSummary and activeAlerts.
 */
export const getGlobalDashboardData = async () => {
  console.log('Fetching real global dashboard data from Supabase...');

  let activeAlerts = [];
  let globalSummary = {
    criticalAlerts: 0,
    locationsAffectedWorldwide: 0,
    globalSeverityLevel: 'No active alerts',
    totalSources: 0, // Fixed value as requested
  };

  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('id, event_type, severity_level, alert_message, start_time, latitude, longitude, location_name, source, country, city')
      .or('end_time.is.null,end_time.gte.now()') // Alerts that haven't ended or end in the future
      // CORRECTED LINE: Ordering by 'created_at' for more consistent results across all data sources
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Global Dashboard Data Fetch Error:', error);
      // IMPORTANT CHANGE: Do NOT throw here. Instead, return default data.
      console.log('Returning default data due to fetch error.');
      return { globalSummary, activeAlerts }; // Return initialized empty data
    }

    activeAlerts = alerts || []; // Ensure it's an array, even if 'alerts' is null

    // --- Calculate Global Summary Metrics ---
    let criticalAlertsCount = 0; // Renamed to avoid conflict with outer scope
    const uniqueLocations = new Set();
    let maxSeverity = 0;

    activeAlerts.forEach(alert => {
      // Count critical alerts (severity 4 or 5)
      if (alert.severity_level >= 4) {
        criticalAlertsCount++;
      }

      // Count unique locations (using location_name for simplicity)
      if (alert.location_name) {
        uniqueLocations.add(alert.location_name);
      } else if (alert.latitude && alert.longitude) {
        // Fallback: use lat/long if location_name is null
        uniqueLocations.add(`${alert.latitude},${alert.longitude}`);
      }

      // Determine max severity for global severity level
      if (alert.severity_level && alert.severity_level > maxSeverity) {
        maxSeverity = alert.severity_level;
      }
    });

    let globalSeverityLevelText = 'No Active Alerts';
    if (activeAlerts.length > 0) {
      if (maxSeverity >= 5) {
        globalSeverityLevelText = 'High Global Severity';
      } else if (maxSeverity >= 3) {
        globalSeverityLevelText = 'Moderate Global Severity';
      } else {
        globalSeverityLevelText = 'Low Global Severity';
      }
    }

    globalSummary = {
      criticalAlerts: criticalAlertsCount,
      locationsAffectedWorldwide: uniqueLocations.size,
      globalSeverityLevel: globalSeverityLevelText,
      totalSources: 1500000, // Fixed value as requested
    };

    console.log('Successfully fetched and processed global dashboard data:', { globalSummary, activeAlerts });
    return { globalSummary, activeAlerts };

  } catch (err) {
    console.error("An unexpected error occurred while fetching global dashboard data:", err);
    // IMPORTANT CHANGE: Also return default data for unexpected errors
    console.log('Returning default data due to unexpected error.');
    return { globalSummary, activeAlerts }; // Return initialized empty data on any unexpected error
  }
};

/**
 * @desc Fetches trending insights data.
 * @returns {Promise<Array<Object>>} Array of trending insight data.
 */
export const getTrendingInsights = async () => {
  // Placeholder implementation: Replace with actual Supabase queries
  console.log('Fetching placeholder trending insights data...');
  return new Promise(resolve => {
    setTimeout(() => {
      const today = new Date();
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        data.push({
          date: d.toISOString().split('T')[0],
          'Flood Alert': Math.floor(Math.random() * 50) + 10,
          'Wildfire Warning': Math.floor(Math.random() * 40) + 5,
          'Earthquake': Math.floor(Math.random() * 30) + 3,
          'Cyber Attack Threat': Math.floor(Math.random() * 60) + 15,
          'Hurricane Advisory': Math.floor(Math.random() * 35) + 7,
          'Drought Watch': Math.floor(Math.random() * 25) + 2,
        });
      }
      resolve(data);
    }, 500);
  });
};

/**
 * @desc Invokes a Supabase Edge Function to generate a global summary message using AI.
 * @param {Object} dataForAI - An object containing relevant data for the AI (e.g., activeAlerts, globalSummary).
 * @param {string} token - The JWT token of the authenticated user.
 * @returns {Promise<string>} The AI-generated three-line summary message.
 */
export const generateWorldSummary = async (dataForAI, token) => {
  if (!token) {
    throw new Error('Authentication token is required to generate AI summary.');
  }

  try {
    // UPDATED: Using the exact function name with hyphens as deployed
    const { data, error } = await supabase.functions.invoke('-generate-world-summary-', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataForAI),
    });

    if (error) {
      console.error('Supabase Edge Function Error [-generate-world-summary-]:', error);
      throw new Error(data?.error || 'Failed to generate AI summary from Edge Function.');
    }

    // The Edge Function is expected to return the summary directly as 'message'
    return data?.message || 'Failed to generate a world summary. Please try again later.';

  } catch (err) {
    console.error('Error in generateWorldSummary API call:', err);
    throw err; // Re-throw to be caught by the component
  }
};