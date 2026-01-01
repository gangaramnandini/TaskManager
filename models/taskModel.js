const pool = require('../config/db');

class Task {
    static async getAllByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date',
            [userId]
        );
        return rows;
    }

    static async create(userId, title, description, dueDate, priority) {
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, dueDate, priority]
        );
        return result.insertId;
    }

    static async findByIdAndUserId(taskId, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?',
            [taskId, userId]
        );
        return rows[0];
    }

    static async findById(taskId) {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
        return rows[0];
    }

    static async update(taskId, userId, data) {
        const { title, description, due_date, priority, status } = data;
        const [result] = await pool.query(
            'UPDATE tasks SET title=?, description=?, due_date=?, priority=?, status=? WHERE task_id=? AND user_id=?',
            [title, description, due_date, priority, status, taskId, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(taskId, userId) {
        const [result] = await pool.query(
            'DELETE FROM tasks WHERE task_id=? AND user_id=?',
            [taskId, userId]
        );
        return result.affectedRows > 0;
    }

    static async updateStatus(taskId, userId, status) {
        const [result] = await pool.query(
            'UPDATE tasks SET status = ? WHERE task_id = ? AND user_id = ?',
            [status, taskId, userId]
        );
        return result.affectedRows > 0;
    }

    static async getFilteredTasks(userId, filterType) {
        let query = '';
        const params = [userId];

        switch (filterType) {
            case 'today':
                query = `SELECT * FROM tasks WHERE user_id = ? AND status='pending' AND due_date >= CURDATE() AND due_date < CURDATE() + INTERVAL 1 DAY ORDER BY due_date ASC`;
                break;
            case 'upcoming':
                query = `SELECT * FROM tasks WHERE user_id = ? AND status='pending' AND due_date > CURDATE() ORDER BY due_date ASC`;
                break;
            case 'pending':
                query = `SELECT * FROM tasks WHERE user_id = ? AND (status='pending' OR status IS NULL) ORDER BY due_date ASC`;
                break;
            case 'completed':
                query = `SELECT * FROM tasks WHERE user_id = ? AND status='completed' ORDER BY due_date DESC`;
                break;
            default:
                query = `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC`;
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }
    static async search(userId, query) {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ?) ORDER BY due_date ASC',
            [userId, `%${query}%`, `%${query}%`]
        );
        return rows;
    }
}

module.exports = Task;
