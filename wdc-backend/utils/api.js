const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const fetchPartnerByApiKey = async (apiKey) => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('api_key', apiKey)
      .single();
    if (error) {
      logger.error(`Error fetching partner: ${error.message}`);
      throw error;
    }
    return data;
  } catch (err) {
    logger.error(`Unexpected error in fetchPartnerByApiKey: ${err.message}`);
    throw err;
  }
};

module.exports = { fetchPartnerByApiKey };