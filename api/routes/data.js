const express = require('express');
const router = express.Router();
const supabase = require('../../db/supabaseClient');

router.post('/create-list', async (req, res) => {
    try {
        const { name, description, user_id } = req.body;
        console.log(name);
        console.log(description);
        console.log(user_id);

        const { data, error } = await supabase
            .from('lists')
            .insert({ name, description, user_id })
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(201).json({
            success: true,
            project: data[0]
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/get-lists', async (req, res) => {
    const { user_id } = req.query;

    console.log(`user id: ${user_id}`);

    try {
        const { data, error } = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', user_id);
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(data);

        return res.status(200).json({ data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;