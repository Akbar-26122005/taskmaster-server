const { createClient } = require("@supabase/supabase-js");
const config = require('../config/config');
require('dotenv').config();

const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);

supabase.auth.signInWithPassword({
    email: config.supabase.email,
    password: config.supabase.password
});

module.exports = supabase;