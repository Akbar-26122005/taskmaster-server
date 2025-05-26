require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    supabase: {
        // email: process.env.SUPABASE_USER_EMAIL,
        // password: process.env.SUPABASE_USER_PASSWORD,
        url: process.env.SUPABASE_PROJECT_URL,
        key: process.env.SUPABASE_API_ANON_KEY
    }
};