const pool = require('../config/db');

exports.addComment = async (req, res) => {
  const { task_id } = req.params;
  const user_id = req.session.user_id;
  const { comment } = req.body; // This must match frontend sent JSON

  if (!user_id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    await pool.query(
      'INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [task_id, user_id, comment]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.editComment = async (req, res) => {
  const { comment_id } = req.params;
  const { comment } = req.body;

  try {
    await pool.query(
      'UPDATE comments SET comment = ? WHERE comment_id = ?',
      [comment, comment_id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

exports.deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    await pool.query('DELETE FROM comments WHERE comment_id = ?', [comment_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

exports.listComments = async (req, res) => {
  const { task_id } = req.params;

  try {
    const [comments] = await pool.query(
      `SELECT c.comment_id, c.task_id, c.user_id, c.comment, c.created_at, u.name
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [task_id]
    );
    res.json(comments);
  } catch (error) {
    console.error('List comments error:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
};
