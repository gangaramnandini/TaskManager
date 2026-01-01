const Comment = require('../models/commentModel');
const History = require('../models/historyModel');
const pool = require('../config/db');

exports.addComment = async (req, res) => {
  const { task_id } = req.params;
  const user_id = req.session.user_id;
  const { comment } = req.body;

  if (!user_id) return res.status(401).send('Not authenticated');
  if (!comment || comment.trim() === '') return res.redirect(`/tasks/${task_id}`);

  try {
    await Comment.create(task_id, user_id, comment);
    await History.create(task_id, user_id, 'comment_added', `Comment added: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`);
    res.redirect(`/tasks/${task_id}`);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).send('Failed to add comment');
  }
};

exports.editComment = async (req, res) => {
  const { comment_id } = req.params;
  const { comment } = req.body;

  try {
    // Determine task_id for redirect - fetch first
    const [[c]] = await pool.query('SELECT task_id FROM comments WHERE comment_id = ?', [comment_id]);

    await Comment.update(comment_id, comment);

    if (c) res.redirect(`/tasks/${c.task_id}`);
    else res.redirect('/tasks'); // Fallback
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).send('Failed to edit comment');
  }
};

exports.deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    // Need task_id to log
    const [[c]] = await pool.query('SELECT task_id, comment FROM comments WHERE comment_id = ?', [comment_id]);
    await Comment.delete(comment_id);

    if (c) {
      await History.create(c.task_id, req.session.user_id, 'comment_deleted', `Comment deleted`);
      res.redirect(`/tasks/${c.task_id}`);
    } else {
      res.redirect('/tasks');
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).send('Failed to delete comment');
  }
};

exports.listComments = async (req, res) => {
  const { task_id } = req.params;

  try {
    const comments = await Comment.getAllByTaskId(task_id);
    res.json(comments);
  } catch (error) {
    console.error('List comments error:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
};
