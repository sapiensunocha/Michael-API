const supabase = require('../src/config/supabaseClient');
const logger = require('../src/config/logger');

async function up() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        create table users (
          id uuid default uuid_generate_v4() primary key,
          name text,
          email text unique not null,
          password text not null,
          created_at timestamp default current_timestamp
        );
      `
    });
    if (error) {
      logger.error(`Migration up error: ${error.message}`);
      throw error;
    }
  } catch (err) {
    logger.error(`Unexpected error in migration up: ${err.message}`);
    throw err;
  }
}

async function down() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql: 'drop table users;'
    });
    if (error) {
      logger.error(`Migration down error: ${error.message}`);
      throw error;
    }
  } catch (err) {
    logger.error(`Unexpected error in migration down: ${err.message}`);
    throw err;
  }
}

module.exports = { up, down };