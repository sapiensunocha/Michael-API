// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import your Supabase client
import { getPartnerProfile } from '../api/backendApi'; // Import the function to get enriched profile

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object, will include token and profile data
  const [loading, setLoading] = useState(true); // Loading state for auth initialization

  // Function to handle setting user state from session and profile data
  // This function now uses the getPartnerProfile from backendApi.js
  const handleUserSession = async (session) => {
    if (session) {
      // User is logged in, session exists
      try {
        // Fetch the complete, enriched profile using our dedicated API function
        const enrichedProfile = await getPartnerProfile();

        // Combine basic session info with the enriched profile data
        setUser({
          id: session.user.id,
          email: session.user.email,
          token: session.access_token, // The JWT for authenticated requests to Edge Functions
          ...enrichedProfile, // Merge the fetched profile data (includes api_key, api_plan, etc.)
        });
      } catch (error) {
        console.error('Error fetching enriched profile in AuthContext:', error);
        // Fallback to basic user info if fetching enriched profile fails
        setUser({
          id: session.user.id,
          email: session.user.email,
          token: session.access_token,
        });
      }
    } else {
      // User is logged out (session is null)
      setUser(null);
    }
    setLoading(false); // Auth state initialized or changed
  };

  useEffect(() => {
    // 1. Set up the Supabase auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // This listener will be triggered on SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
        handleUserSession(session);
      }
    );

    // 2. Perform initial session check when the component mounts
    // This is important for handling page refreshes or direct navigation.
    const getInitialSession = async () => {
      setLoading(true); // Indicate loading while checking initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching initial session:', sessionError);
        setUser(null); // Ensure user is null on error
        setLoading(false);
      } else {
        // Directly process the initial session using the same logic as the listener
        await handleUserSession(session); // Use await here to ensure state is set before setLoading(false)
      }
    };
    getInitialSession();

    // Clean up the subscription when the component unmounts
    return () => {
      if (authListener && authListener.subscription) { // Check if authListener and its subscription exist
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Login function: Set user state directly after successful login API call
  // This is used by Login.jsx after a successful loginUser API call
  // The userData passed here should already be the enriched user object from backendApi.js
  const login = (userData) => {
    setUser(userData);
    setLoading(false); // Assuming login completes the loading state
  };

  // Logout function: Clears user state by signing out from Supabase Auth
  const logout = async () => {
    setLoading(true); // Indicate loading while logging out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    }
    // The onAuthStateChange listener will handle setting setUser(null) after signOut
    setLoading(false);
  };

  // Provide the user state, loading status, and auth functions to children components
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};