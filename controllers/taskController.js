const pool = require('../config/db');

// Show all user's tasks
exports.getAllTasks = async (req, res) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date',
      [req.session.user_id]
    );
    res.render('tasks', { tasks, userName: req.session.userName || 'User', title: 'My Tasks' });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send('Error fetching tasks');
  }
};

// Show Add Task form
exports.getAddTaskPage = (req, res) => {
  res.render('task-add', { userName: req.session.userName || 'User', title: 'Add New Task' });
};

// Add new task
exports.addTask = async (req, res) => {
  const { title, description, due_date, priority } = req.body;
  try {
    await pool.query(
      'INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)',
      [req.session.user_id, title, description, due_date, priority]
    );
    res.redirect('/tasks');
  } catch (err) {
    console.error('Add task error:', err);
    res.status(500).send('Error adding task');
  }
};

// Show Edit Task form
exports.getEditTaskPage = async (req, res) => {
  try {
    const [[task]] = await pool.query('SELECT * FROM tasks WHERE task_id=? AND user_id=?', [req.params.id, req.session.user_id]);
    if (!task) return res.status(404).send('Task not found or unauthorized');
    res.render('task-edit', { task, userName: req.session.userName || 'User', title: 'Edit Task' });
  } catch (err) {
    console.error('Load edit page error:', err);
    res.status(500).send('Error loading edit page');
  }
};

// Submit Task edit
exports.editTask = async (req, res) => {
  const { title, description, due_date, priority, status } = req.body; // include status
  try {
    const [result] = await pool.query(
      'UPDATE tasks SET title=?, description=?, due_date=?, priority=?, status=? WHERE task_id=? AND user_id=?',
      [title, description, due_date, priority, status, req.params.id, req.session.user_id] // include status here
    );

    if (result.affectedRows === 0)
      return res.status(404).send('Task not found or unauthorized');

    res.redirect('/tasks');
  } catch (err) {
    console.error('Edit task error:', err);
    res.status(500).send('Error editing task');
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE task_id=? AND user_id=?', [req.params.id, req.session.user_id]);
    if (result.affectedRows === 0) return res.status(404).send('Task not found or unauthorized');
    res.redirect('/tasks');
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).send('Error deleting task');
  }
};

exports.toggleStatusAjax = async (req, res) => {
  const { status } = req.body; // 'completed' or 'pending'
  const taskId = req.params.id;
  const userId = req.session.user_id;

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET status = ? WHERE task_id = ? AND user_id = ?',
      [status, taskId, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating task' });
  }
};


// exports.getTaskDetails = async (req, res) => {
//   const { task_id } = req.params;
//   try {
//     const [[task]] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [task_id]);
//     const [subtasks] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [task_id]);

//     if (!task) return res.status(404).send('Task not found');

//     res.render('task-details', { task, subtasks, title: 'Task Details' });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// };


// controllers/taskController.js

exports.getTaskDetails = async (req, res) => {
  const { task_id } = req.params;
  try {
    // Fetch the main task
    const [[task]] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [task_id]);
    if (!task) return res.status(404).send('Task not found');

    // Fetch subtasks
    const [subtasks] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [task_id]);

    // Fetch comments with user names
    const [comments] = await pool.query(`
      SELECT c.*, u.name FROM comments c 
      JOIN users u ON c.user_id = u.user_id
      WHERE c.task_id = ? 
      ORDER BY c.created_at ASC
    `, [task_id]);

    // User ID for permission checks (make sure session exists and user_id is set)
    const user_id = req.session && req.session.user_id ? req.session.user_id : null;

    // Render the task-details view with all data
    res.render('task-details', { task, subtasks, comments, user_id: req.session.user_id, title: 'Task Details' });



  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).send('Internal Server Error');
  }
};

