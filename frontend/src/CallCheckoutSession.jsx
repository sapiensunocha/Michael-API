// src/CallCheckoutSession.jsx
import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CallCheckoutSession() {
  useEffect(() => {
    async function callCheckout() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        return;
      }
      if (!session) {
        console.log('No user logged in');
        return;
      }

      const accessToken = session.access_token;

      try {
        const response = await fetch('http://127.0.0.1:54321/functions/v1/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            planId: 'enterprise',
            success_url: 'http://localhost:3000/dashboard?payment=success',
            cancel_url: 'http://localhost:3000/pricing?payment=cancelled',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          return;
        }

        const result = await response.json();
        console.log('Edge Function response:', result);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }

    callCheckout();
  }, []);

  return <div>Calling checkout session function...</div>;
}