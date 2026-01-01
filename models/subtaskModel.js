const pool = require('../config/db');

class Subtask {
    static async create(taskId, title) {
        await pool.query('INSERT INTO subtasks (task_id, title) VALUES (?, ?)', [taskId, title]);
        // Return all subtasks for the task to update the UI
        return this.getAllByTaskId(taskId);
    }

    static async getAllByTaskId(taskId) {
        const [rows] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [taskId]);
        return rows;
    }

    static async delete(subtaskId) {
        await pool.query('DELETE FROM subtasks WHERE subtask_id = ?', [subtaskId]);
        return true;
    }

    static async toggleStatus(subtaskId) {
        const [[subtask]] = await pool.query('SELECT status FROM subtasks WHERE subtask_id = ?', [subtaskId]);
        if (!subtask) return null;

        const newStatus = subtask.status === 'pending' ? 'completed' : 'pending';
        await pool.query('UPDATE subtasks SET status = ? WHERE subtask_id = ?', [newStatus, subtaskId]);
        return newStatus;
    }

    static async updateTitle(subtaskId, title) {
        await pool.query('UPDATE subtasks SET title = ? WHERE subtask_id = ?', [title, subtaskId]);
        return true;
    }
}

module.exports = Subtask;
