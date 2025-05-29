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

router.get('/check', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ isAuthenticated: false, message: 'The token does not exist' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .limit(1)
        
        const user = data[0];

        return res.status(201).json({
            isAuthenticated: true,
            user: {
                id: user.userId
                ,email: user.email
                ,first_name: user.first_name
                ,last_name: user.last_name
                ,middle_name: user.middle_name
            }
        });
    } catch (err) {
        res.status(500).json({ isAuthenticated: false, message: `${err}` });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password, first_name, last_name, middle_name } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, forst name and last name are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ success: false, message: 'Invalid email format' });

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        const { data: existingUsers, error: lookupError} = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .limit(1);
        
        if (lookupError) {
            console.error('Supabase lookup error:', lookupError);
            return res.status(500).json({ success: false, message: 'Dtaabase error' });
        }

        if (existingUsers.length > 0)
            return res.status(409).json({ success: false, message: 'Email already exists' });

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
            return res.status(500).json({ success: false, message: 'Failed to create user' });
        }

        // Генерация jwt-токена
        const token = jwt.sign({ userId: user[0].id },process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,              // only https
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        return res.status(200).json({
            message: 'User created successfully',
            success: true,
            user: {
                id: newUser[0].id
                ,email: newUser[0].email
                ,first_name: newUser[0].first_name
                ,last_name: newUser[0].last_name
                ,middle_name: newUser[0].middle_nam
            }
        });

    } catch (err) {
        console.log('Error:', err);
        return res.status(401).json({ success: false });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Enail and passwordare required' });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);

        if (error) {
            console.error('Supabase error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        const isPasswordValid = verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Генерация jwt-токена
        const token = jwt.sign({ userId: user[0].id },process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,              // only https
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        return res.status(200).json({
            message: 'Login successful',
            success: true,
            user: {
                id: user.id
                ,email: user.email
                ,first_name: user.first_name
                ,last_name: user.last_name
                ,middle_name: user.middle_nam
            }
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;