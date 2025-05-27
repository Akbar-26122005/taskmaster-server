const router = require('express').Router();
const jwt = require('jsonwebtoken');
const supabase = require('../../db/supabaseClient');
const bcrypt = require('bcrypt');
const validateAuthToken = require('./middlewares/validateAuhToken');
require('dotenv').config();

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, storedHash) {
    return await bcrypt.compare(password, storedHash);
}

router.get('/check', (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ isAuthenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return req.status(201).json({
            isAuthenticated: true,
            user: {
                id: decoded.userId,
                email: decoded.email
            }
        });
    } catch (err) {
        res.status(401).json({ isAuthenticated: false });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password, first_name, last_name, middle_name } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                error: 'Email, password, forst name and last name are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        const { data: existingUsers, error: lookupError} = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .limit(1);
        
        if (lookupError) {
            console.error('Supabase lookup error:', lookupError);
            return res.status(500).json({ error: 'Dtaabase error' });
        }

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = hashPassword(password);

        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashedPassword,
                first_name,
                last_name,
                middle_name: middle_name || null,
            }])
            .select('id, email, first_name, last_name')
        
        if (createError) {
            console.error('Supabase error:', createError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        const token = jwt.sign(
            {
                userId: newUser[0].id
                ,email: newUser[0].email
                ,first_name: newUser.first_name
                ,last_name: newUser.last_name
                ,middle_name: newUser.middle_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,              // only https
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        return res.status(200).json({
            message: 'User created successfully',
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                first_name: newUser[0].first_name,
                last_name: newUser[0].last_name
            },
            token
        });

    } catch (err) {
        console.log('Error:', err);
    }
});

router.post('/login', validateAuthToken, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Enail and passwordare required' });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);

        if (error) {
            console.error('Supabase error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        const isPasswordValid = verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user[0].id
                ,email: user[0].email
                ,first_name: user.first_name
                ,last_name: user.last_name
                ,middle_name: user.middle_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,              // only https
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        return res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;