const pool = require('../config/db');

exports.addSubtask = async (req, res) => {
  const { task_id } = req.params;
  const { title } = req.body;
  try {
    await pool.query('INSERT INTO subtasks (task_id, title) VALUES (?, ?)', [task_id, title]);
    const [subtasks] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [task_id]);
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: 'Error adding subtask' });
  }
};

exports.deleteSubtask = async (req, res) => {
  const { subtask_id } = req.params;
  try {
    await pool.query('DELETE FROM subtasks WHERE subtask_id = ?', [subtask_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting subtask' });
  }
};

exports.toggleSubtaskStatus = async (req, res) => {
  const { subtask_id } = req.params;
  try {
    const [[subtask]] = await pool.query('SELECT status FROM subtasks WHERE subtask_id = ?', [subtask_id]);
    if (!subtask) return res.status(404).json({ error: 'Not found' });
    const newStatus = subtask.status === 'pending' ? 'completed' : 'pending';
    await pool.query('UPDATE subtasks SET status = ? WHERE subtask_id = ?', [newStatus, subtask_id]);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Error toggling subtask' });
  }
};

exports.editSubtask = async (req, res) => {
  const { subtask_id } = req.params;
  const { title } = req.body;
  try {
    await pool.query('UPDATE subtasks SET title = ? WHERE subtask_id = ?', [title, subtask_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error editing subtask' });
  }
};

// API to get all subtasks for a task (AJAX refresh)
exports.listSubtasksForTask = async (req, res) => {
  const { task_id } = req.params;
  try {
    const [subtasks] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [task_id]);
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: 'Error loading subtasks' });
  }
};
