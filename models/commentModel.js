const pool = require('../config/db');

class Comment {
    static async create(taskId, userId, comment) {
        await pool.query(
            'INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)',
            [taskId, userId, comment]
        );
        return true;
    }

    static async update(commentId, comment) {
        await pool.query(
            'UPDATE comments SET comment = ? WHERE comment_id = ?',
            [comment, commentId]
        );
        return true;
    }

    static async delete(commentId) {
        await pool.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);
        return true;
    }

    static async getAllByTaskId(taskId) {
        const [rows] = await pool.query(
            `SELECT c.comment_id, c.task_id, c.user_id, c.comment, c.created_at, u.name
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
            [taskId]
        );
        return rows;
    }
}

module.exports = Comment;
