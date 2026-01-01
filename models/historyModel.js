const pool = require('../config/db');

class History {
    static async create(taskId, userId, actionType, details, taskTitle = null) {
        try {
            // If taskTitle is not provided, try to fetch it? 
            // Better: passing it in prevents extra DB call.
            // If checking persistence: check if we should look it up.

            // For now, let's allow optional taskTitle. If provided, save it.
            // If not provided, we might want to fetch it if we want strong persistence, 
            // but for "deleted" action we MUST provide it.

            // Wait, if I change the signature, I need to update all callers.
            // Or I can fetch it if missing.

            let title = taskTitle;
            if (!title && taskId) {
                const [t] = await pool.query('SELECT title FROM tasks WHERE task_id = ?', [taskId]);
                if (t.length > 0) title = t[0].title;
            }

            const [result] = await pool.query(
                'INSERT INTO task_history (task_id, user_id, action_type, details, task_title) VALUES (?, ?, ?, ?, ?)',
                [taskId, userId, actionType, details, title]
            );
            return result.insertId;
        } catch (err) {
            console.error('Error logging history:', err);
            // Don't throw, just log error so main flow isn't interrupted
            return null;
        }
    }

    static async getByTaskId(taskId) {
        const [rows] = await pool.query(`
            SELECT h.*, u.name as user_name 
            FROM task_history h 
            JOIN users u ON h.user_id = u.user_id 
            WHERE h.task_id = ? 
            ORDER BY h.created_at DESC, h.history_id DESC
        `, [taskId]);
        return rows;
    }

    static async getAllByUserId(userId) {
        const [rows] = await pool.query(`
            SELECT h.*, COALESCE(t.title, h.task_title, 'Deleted Task') as task_title 
            FROM task_history h 
            LEFT JOIN tasks t ON h.task_id = t.task_id 
            WHERE h.user_id = ? 
            ORDER BY h.created_at DESC, h.history_id DESC
        `, [userId]);
        return rows;
    }
}

module.exports = History;
