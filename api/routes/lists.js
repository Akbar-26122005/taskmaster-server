const router = require('express').Router();
const supabase = require('../../db/supabaseClient');

// Создание новой записи списка задач
router.post('/create', async (req, res) => {
    try {
        const { name, description, user_id } = req.body;

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
            list: data[0]
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение всех записей списков задач
router.get('/get', async (req, res) => {
    const { user_id } = req.query;

    try {
        const { data, error } = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', user_id);
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Удаление выбранных записей списков задач
router.post('/delete', async (req, res) => {
    const { list_ids } = req.body;

    try {
        const { data, error } = await supabase
            .from('lists')
            .delete()
            .in('id', list_ids);
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('Успешное удаление данных.');
        return res.status(200).json({ data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' })
    }

});

module.exports = router;