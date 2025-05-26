const crypto = require('crypto');
const supabase = require('../../../db/supabaseClient');

const secretKey = process.env.AUTH_TOKEN;

const generateToken = (userId, nonce) => {
    const data = `${userId}:${secretKey}:${nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

const validateAuthToken = async (req, res, next) => {
    const clientToken = req.headers['x-auth-token'];
    const user_id = req.body.user_code;

    if (!clientToken || !user_id) {
        return resstatus(400).json({ message: 'Ты ничего не забыл добавить :)' });
    }

    const [timestampStr, token, nonce] = clientToken.split('-');
    if (!timestampStr || !token || !nonce) {
        return res.status(400).json({ message: 'Неверный формат токена' });
    }

    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) {
        return res.status(400).json({ message: 'Фу, токен слишком старый' });
    }

    try {
        const { data: selectedData, error: selectedError } = await supabase
            .from('users')
            .select('*')
            .eq('token', clientToken)
        
        if (selectedError) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (selectedData.length > 0) {
            return res.status(403).json({ message: 'Такой токен уже использовали! Не жульничай!' });
        }

        const { data, error } = await supabase
            .from('users')
            .insert({
                created_at: Date.now(),
                token: clientToken,
                user_id
            })
            .select()
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return res.status(500).json({ message: 'Внутренняя проблема сервера' })
    }

    next();
};

module.exports = validateAuthToken;