const Subtask = require('../models/subtaskModel');
const History = require('../models/historyModel');
const pool = require('../config/db'); // Needed for manual lookup

exports.addSubtask = async (req, res) => {
  const { task_id } = req.params;
  const { title } = req.body;
  try {
    await Subtask.create(task_id, title);
    await History.create(task_id, req.session.user_id, 'subtask_added', `Subtask added: ${title}`);
    res.redirect(req.get('Referer') || `/tasks/${task_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding subtask');
  }
};

exports.deleteSubtask = async (req, res) => {
  const { subtask_id } = req.params;
  try {
    // manually fetch to get task_id and title for logging
    const [[subtask]] = await pool.query('SELECT * FROM subtasks WHERE subtask_id = ?', [subtask_id]);

    await Subtask.delete(subtask_id);

    if (subtask) {
      await History.create(subtask.task_id, req.session.user_id, 'subtask_deleted', `Subtask deleted: ${subtask.title}`);
    }

    res.redirect(req.get('Referer') || '/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting subtask');
  }
};

exports.toggleSubtaskStatus = async (req, res) => {
  const { subtask_id } = req.params;
  try {
    const [[subtask]] = await pool.query('SELECT * FROM subtasks WHERE subtask_id = ?', [subtask_id]);
    const newStatus = await Subtask.toggleStatus(subtask_id);

    if (subtask && newStatus) {
      await History.create(subtask.task_id, req.session.user_id, 'subtask_updated', `Subtask '${subtask.title}' marked as ${newStatus}`);
    }

    res.redirect(req.get('Referer') || '/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error toggling subtask');
  }
};

exports.editSubtask = async (req, res) => {
  const { subtask_id } = req.params;
  const { title } = req.body;
  try {
    await Subtask.updateTitle(subtask_id, title);
    res.redirect(req.get('Referer') || '/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error editing subtask');
  }
};

exports.listSubtasksForTask = async (req, res) => {
  // Kept for API compatibility if needed, but UI uses SSR
  const { task_id } = req.params;
  try {
    const subtasks = await Subtask.getAllByTaskId(task_id);
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: 'Error loading subtasks' });
  }
};
