const supabase = require('../config/supabaseClient'); // Supabase client for database interaction
const logger = require('../config/logger'); // Logger for error and info messages

/**
 * @desc Get the profile of the authenticated partner.
 * @route GET /api/partners/profile
 * @access Private (requires JWT authentication)
 * @param {Object} req - The request object, with req.user.id populated by authMiddleware.
 * @param {Object} res - The response object.
 */
const getPartnerProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: partner, error } = await supabase
      .from('partners')
      .select('id, name, contact_email, api_key, plan_name, status, created_at')
      .eq('user_id', userId)
      .single();

    if (error || !partner) {
      logger.error(`Failed to fetch partner profile for user ID ${userId}: ${error ? error.message : 'Partner not found.'}`);
      return res.status(404).json({ message: 'Partner profile not found.' });
    }

    res.json(partner);

  } catch (err) {
    logger.error(`Server error fetching partner profile for user ID ${userId}: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching partner profile.' });
  }
};

/**
 * @desc Get global dashboard summary data (key numbers, active disasters, etc.) and recent alerts.
 * This data is intended for the dashboard overview and should be accessible to all authenticated users.
 * @route GET /api/partners/dashboard/global-summary
 * @access Private (requires JWT authentication)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getGlobalDashboardData = async (req, res) => {
  try {
    // --- Derive Global Summary Metrics from 'alerts' table ---

    // 1. Critical Alerts: Count of alerts with high severity_level
    const { count: criticalAlertsCount, error: criticalAlertsError } = await supabase
      .from('alerts')
      .select('id', { count: 'exact' })
      .gte('severity_level', 4); // Severity level 4 or higher is considered critical

    if (criticalAlertsError) {
      logger.error(`Failed to count critical alerts from 'alerts': ${criticalAlertsError.message}`);
      return res.status(500).json({ message: `Failed to fetch critical alerts count: ${criticalAlertsError.message}` });
    }

    // 2. Locations Affected Worldwide: Count of distinct location_name across ALL alerts
    const { data: allDistinctLocations, error: allDistinctLocationsError } = await supabase
        .from('alerts')
        .select('location_name')
        .not('location_name', 'is', null); // Only count locations that are not null

    if (allDistinctLocationsError) {
        logger.error(`Failed to fetch distinct locations for worldwide count: ${allDistinctLocationsError.message}`);
        return res.status(500).json({ message: `Failed to fetch locations affected worldwide data: ${allDistinctLocationsError.message}` });
    }
    const locationsAffectedWorldwideCount = new Set(allDistinctLocations.map(alert => alert.location_name)).size;


    // 3. Global Severity Level (Text): Average severity_level of ACTIVE alerts, mapped to text
    const { data: activeAlertSeverities, error: severitiesError } = await supabase
      .from('alerts')
      .select('severity_level')
      .is('end_time', null) // Only consider active alerts
      .not('severity_level', 'is', null); // Exclude null severity levels from average

    let globalSeverityText = 'No Active Alerts'; // Default text if no active alerts with severity data

    if (severitiesError) {
        logger.error(`Failed to fetch active alert severities for average calculation: ${severitiesError.message}`);
        // Keep globalSeverityText as 'No Active Alerts' or 'Data Error'
    } else if (activeAlertSeverities && activeAlertSeverities.length > 0) {
      const sumSeverities = activeAlertSeverities.reduce((sum, alert) => sum + alert.severity_level, 0);
      const averageSeverity = sumSeverities / activeAlertSeverities.length;

      if (averageSeverity >= 4.0) {
        globalSeverityText = 'High Global Severity';
      } else if (averageSeverity >= 2.5) {
        globalSeverityText = 'Moderate Global Severity';
      } else {
        globalSeverityText = 'Low Global Severity';
      }
    }

    // 4. Sources: Simulated million number for customer understanding
    const totalSources = 1350000; // Hardcoded simulated number

    const globalSummary = {
      criticalAlerts: criticalAlertsCount || 0,
      locationsAffectedWorldwide: locationsAffectedWorldwideCount || 0,
      globalSeverityLevel: globalSeverityText, // Now a string
      totalSources: totalSources,
    };

    // --- Fetch Recent Active Alerts (for dashboard preview and map) ---
    // This part remains the same as it's already working well
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id, event_type, location_name, severity_level, alert_message, start_time, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('start_time', { ascending: false })
      .limit(50);

    if (alertsError) {
      logger.error(`Failed to fetch recent alerts for dashboard: ${alertsError.message}`);
      return res.status(500).json({ message: `Failed to fetch recent alerts data: ${alertsError.message}` });
    }

    const formattedAlerts = alerts.map(alert => {
      let severityText = 'Unknown';
      if (alert.severity_level !== null && alert.severity_level >= 4) {
        severityText = 'High';
      } else if (alert.severity_level !== null && alert.severity_level >= 2) {
        severityText = 'Medium';
      } else if (alert.severity_level !== null && alert.severity_level >= 1) {
        severityText = 'Low';
      }

      return {
        id: alert.id,
        event_type: alert.event_type,
        location_name: alert.location_name || 'N/A',
        severity_level: alert.severity_level,
        severity_text: severityText,
        alert_message: alert.alert_message,
        start_time: alert.start_time,
        latitude: parseFloat(alert.latitude),
        longitude: parseFloat(alert.longitude),
      };
    });

    res.json({
      globalSummary: globalSummary,
      activeAlerts: formattedAlerts,
    });

  } catch (err) {
    logger.error(`Server error fetching global dashboard data: ${err.message}`);
    res.status(500).json({ message: `Server error fetching global dashboard data: ${err.message}` });
  }
};

/**
 * @desc Get trending insights for the dashboard preview.
 * This function will now fetch and aggregate alert data for the last 7 days, up to the current moment.
 * @route GET /api/partners/dashboard/trending-insights
 * @access Private (requires JWT authentication)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getTrendingInsights = async (req, res) => {
  try {
    const endDate = new Date();
    // Set endDate to the end of today (e.g., 2025-07-07 23:59:59.999)
    endDate.setHours(23, 59, 59, 999); 
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7); // Go back 7 days, so we cover 8 days total including today


    // --- 1. Fetch ALL distinct event types from the database ---
    // This ensures all possible event types are included in the graph, even if they have 0 counts
    const { data: distinctTypes, error: distinctTypesError } = await supabase
      .from('alerts')
      .select('event_type', { distinct: true })
      .not('event_type', 'is', null);

    if (distinctTypesError) {
      logger.error(`Error fetching distinct event types: ${distinctTypesError.message}`);
      return res.status(500).json({ error: 'Failed to retrieve distinct event types.' });
    }

    // Prepare a set of all known event types for padding
    const allKnownEventTypes = new Set(
      distinctTypes.map(type => (type.event_type || 'Unknown').toLowerCase())
    );

    // --- 2. Fetch relevant alerts for the 7-day period based on any date column ---
    // This query now tries to capture events that were 'active' or 'recorded' within the window
    const { data: relevantAlerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id, event_type, start_time, end_time, created_at') // Added 'id' for potential future use or debugging
      .or(`start_time.gte.${startDate.toISOString()},end_time.gte.${startDate.toISOString()},created_at.gte.${startDate.toISOString()}`)
      .lte('start_time', endDate.toISOString()); // Still ensure start_time is not in distant future

    if (alertsError) {
      logger.error(`Error fetching relevant alerts for trending insights: ${alertsError.message}`);
      return res.status(500).json({ error: 'Failed to retrieve trending insights data.' });
    }

    // --- 3. Aggregate trend data for each day, considering all three date columns ---
    const trendData = {};
    const iterDate = new Date(startDate);
    iterDate.setHours(0, 0, 0, 0); // Ensure start of day for iteration

    // Initialize trendData for all 8 days in the window with all known event types
    // Current time is Monday, July 7, 2025 at 9:28:11 PM EDT.
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today for comparison

    for (let i = 0; i < 8; i++) { // Loop for 8 days (startDate to endDate inclusive)
        const d = new Date(iterDate);
        d.setDate(iterDate.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        
        // Only include dates up to today in the generated data structure
        if (d.getTime() <= today.getTime()) { // Use 'today' variable
            trendData[dateString] = { date: dateString };
            allKnownEventTypes.forEach(eventType => {
                trendData[dateString][eventType] = 0; // Initialize all types to 0 for each day
            });
        }
    }

    // Populate counts based on relevant date columns
    relevantAlerts.forEach(alert => {
        const eventType = (alert.event_type || 'Unknown').toLowerCase();

        // Keep track of which dates this specific alert has already been counted for to avoid triple-counting on same day
        const countedDatesForAlert = new Set(); 

        // 1. Count by start_time
        if (alert.start_time) {
            const dateString = new Date(alert.start_time).toISOString().split('T')[0];
            if (trendData[dateString] && !countedDatesForAlert.has(dateString + eventType + 'start')) {
                trendData[dateString][eventType]++;
                countedDatesForAlert.add(dateString + eventType + 'start');
            }
        }
        
        // 2. Count by created_at (if different date than start_time or start_time is null)
        if (alert.created_at) {
            const dateString = new Date(alert.created_at).toISOString().split('T')[0];
            const startTimeDateString = alert.start_time ? new Date(alert.start_time).toISOString().split('T')[0] : null;

            if (trendData[dateString] && dateString !== startTimeDateString && !countedDatesForAlert.has(dateString + eventType + 'created')) {
                trendData[dateString][eventType]++;
                countedDatesForAlert.add(dateString + eventType + 'created');
            }
        }

        // 3. Count for "Ongoing" events for each day they are active within the 7-day window
        let currentDay = new Date(startDate);
        currentDay.setHours(0, 0, 0, 0); // Ensure start of day for iteration
        
        while (currentDay.getTime() <= today.getTime()) { // Iterate up to and including today
            const currentDayString = currentDay.toISOString().split('T')[0];

            const alertStartTime = alert.start_time ? new Date(alert.start_time).toISOString().split('T')[0] : null;
            const alertEndTime = alert.end_time ? new Date(alert.end_time).toISOString().split('T')[0] : null;

            const startedOnOrBeforeCurrentDay = alertStartTime && alertStartTime <= currentDayString;
            const endsOnOrAfterCurrentDayOrNull = !alertEndTime || alertEndTime >= currentDayString;

            // An event is "ongoing" on currentDay if it started on or before currentDay
            // AND its end_time is null or on/after currentDay.
            // We want to count it *only if it's not already counted for this day by its start_time or created_at*
            // or if it's genuinely spanning multiple days.
            if (startedOnOrBeforeCurrentDay && endsOnOrAfterCurrentDayOrNull) {
                // If the event truly spans this day, and this day's count for this alert hasn't been incremented by other means
                const uniqueKeyForDayAndAlert = currentDayString + alert.id + eventType; // Unique key to avoid double counting same alert on same day
                if (trendData[currentDayString] && !countedDatesForAlert.has(uniqueKeyForDayAndAlert)) {
                    trendData[currentDayString][eventType]++;
                    countedDatesForAlert.add(uniqueKeyForDayAndAlert);
                }
            }
            currentDay.setDate(currentDay.getDate() + 1); // Move to the next day
        }
    });

    const formattedInsights = Object.values(trendData).sort((a, b) => a.date.localeCompare(b.date));

    // The frontend's preprocessTrendingInsights no longer needs to deduce allEventTypes
    // because we send a comprehensive list now.
    res.json(formattedInsights);

  } catch (err) {
    logger.error(`Server error fetching trending insights: ${err.message}`);
    res.status(500).json({ error: 'Server error fetching trending insights.' });
  }
};

/**
 * @desc Update a partner's subscription plan.
 * This route is currently protected by 'admin' middleware for demonstration.
 * You might adjust the logic to allow users to update their *own* plan without admin rights.
 * @route PUT /api/partners/:id/plan
 * @access Private/Admin (requires JWT authentication and admin role)
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the partner to update.
 * @param {Object} req.body - The request body containing the new plan_name and status.
 * @param {string} req.body.plan_name - The new plan name (e.g., 'basic', 'pro', 'enterprise').
 * @param {string} [req.body.status] - Optional: The new status (e.g., 'active', 'inactive', 'cancelled').
 * @param {Object} res - The response object.
 */
const updatePartnerPlan = async (req, res) => {
  const partnerId = req.params.id;
  const { plan_name, status } = req.body;

  if (!plan_name) {
    logger.warn(`Attempt to update partner plan for ID ${partnerId} without plan_name.`);
    return res.status(400).json({ message: 'New plan_name is required.' });
  }

  try {
    const { data: planExists, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', plan_name)
      .single();

    if (planError || !planExists) {
      logger.warn(`Attempt to set invalid plan_name '${plan_name}' for partner ID ${partnerId}.`);
      return res.status(400).json({ message: `Invalid plan name: ${plan_name}.` });
    }

    const updateData = { plan_name: plan_name };
    if (status) {
      updateData.status = status;
    }

    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', partnerId)
      .select('id, name, plan_name, status')
      .single();

    if (updateError || !updatedPartner) {
      logger.error(`Failed to update partner plan for ID ${partnerId}: ${updateError ? updateError.message : 'Partner not found.'}`);
      return res.status(404).json({ message: 'Partner not found or update failed.' });
    }

    res.json({
      message: 'Partner plan updated successfully.',
      partner: updatedPartner,
    });

  } catch (err) {
    logger.error(`Server error updating partner plan for ID ${partnerId}: ${err.message}`);
    res.status(500).json({ message: `Server error updating partner plan: ${err.message}` });
  }
};

module.exports = {
  getPartnerProfile,
  updatePartnerPlan,
  getGlobalDashboardData,
  getTrendingInsights,
};