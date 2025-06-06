const router = require('express').Router();
const supabase = require('../../db/supabaseClient');

// Содание новой записи задачи
router.post('/create', async (req, res) => {
    try {
        const { title, list_id, is_done } = req.body;

        const { data, error } = await supabase
            .from('tasks')
            .insert({ title, list_id, is_done })
            .select();

        if (error) {
            console.error('Supabase error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({
            success: true,
            task: data[0]
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update', async (req, res) => {
    try {
        const { id, title, is_done } = req.body;

        const { data, error } = await supabase
            .from('tasks')
            .update({ title, is_done })
            .eq('id', id)
            .select();
        
        if (error) throw error;

        return res.status(200).json({
            success: true,
            task: data[0]
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Получение всех записей задач
router.get('/get', async (req, res) => {
    try {
        const { list_id } = req.query;

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('list_id', list_id);

        if (error) {
            console.error('Supabase error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/delete', async (req, res) => {
    try {
        const { id } = req.body;

        const { data, error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Supabase error:', err);
            return res.status(500).json({
                success: true,
                error: 'Database error'
            });
        }

        return res.status(200).json({ data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: true,
            error: 'Internal server error'
        });
    }
});

module.exports = router;