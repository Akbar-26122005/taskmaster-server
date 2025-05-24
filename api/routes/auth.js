const express = require('express');
const router = express.Router();
const supabase = require('../../db/supabaseClient');
const bcrypt = require('bcrypt');
require('dotenv').config()
;

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

async function verifyPassword(password, storedHash) {
    return await bcrypt.compare(password, storedHash);
}

router.post('/signup', async (req, res) => {
    try {
    } catch (err) {
    }
});

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;