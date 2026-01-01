const Task = require('../models/taskModel');
const Subtask = require('../models/subtaskModel');
const Comment = require('../models/commentModel');
const History = require('../models/historyModel');

// Show all user's tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllByUserId(req.session.user_id);
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
    const taskId = await Task.create(req.session.user_id, title, description, due_date, priority);
    await History.create(taskId, req.session.user_id, 'created', 'Task created');
    res.redirect('/tasks');
  } catch (err) {
    console.error('Add task error:', err);
    res.status(500).send('Error adding task');
  }
};

// Show Edit Task form
exports.getEditTaskPage = async (req, res) => {
  try {
    const task = await Task.findByIdAndUserId(req.params.id, req.session.user_id);
    if (!task) return res.status(404).send('Task not found or unauthorized');
    res.render('task-edit', { task, userName: req.session.userName || 'User', title: 'Edit Task' });
  } catch (err) {
    console.error('Load edit page error:', err);
    res.status(500).send('Error loading edit page');
  }
};

// Submit Task edit
exports.editTask = async (req, res) => {
  try {
    const success = await Task.update(req.params.id, req.session.user_id, req.body);
    if (!success) return res.status(404).send('Task not found or unauthorized');

    // Fetch previous state to compare? Or just log general update for now
    await History.create(req.params.id, req.session.user_id, 'updated', 'Task details updated');

    res.redirect('/tasks');
  } catch (err) {
    console.error('Edit task error:', err);
    res.status(500).send('Error editing task');
  }
};

// Delete task
// Delete task
exports.deleteTask = async (req, res) => {
  try {
    // Fetch task first to get the title for logging
    const task = await Task.findByIdAndUserId(req.params.id, req.session.user_id);
    if (!task) return res.status(404).send('Task not found or unauthorized');

    const success = await Task.delete(req.params.id, req.session.user_id);
    if (success) {
      // Log deletion. Pass null as taskId since the task is gone (FK constraint would fail).
      // Pass task.title explicitly so it persists in history.
      await History.create(null, req.session.user_id, 'deleted', 'Task deleted', task.title);
    }

    res.redirect('/tasks');
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).send('Error deleting task');
  }
};

exports.toggleStatusSync = async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;
  const userId = req.session.user_id;

  try {
    const success = await Task.updateStatus(taskId, userId, status);
    if (!success) {
      // ideally add a flash message here
    } else {
      await History.create(taskId, userId, 'status_changed', `Status changed to ${status}`);
    }
    const referer = req.get('Referer') || '/tasks';
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating task');
  }
};


exports.getTaskDetails = async (req, res) => {
  const { task_id } = req.params;
  try {
    // Fetch the main task
    const task = await Task.findById(task_id);
    if (!task) return res.status(404).send('Task not found');

    // Fetch subtasks
    const subtasks = await Subtask.getAllByTaskId(task_id);

    // Fetch comments with user names
    const comments = await Comment.getAllByTaskId(task_id);

    // Fetch history
    const history = await History.getByTaskId(task_id);

    // Render the task-details view with all data
    res.render('task-details', { task, subtasks, comments, history, user_id: req.session.user_id, title: 'Task Details' });

  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getFilteredTasksPartial = async (req, res) => {
  if (!req.session.user_id) return res.status(401).send('Unauthorized');

  const userId = req.session.user_id;
  const filter = req.query.filter || 'all';

  try {
    const tasks = await Task.getFilteredTasks(userId, filter);
    res.render('partials/tasksList', {
      title: 'Task List',
      tasks,
      filter,
      layout: false
    });
  } catch (err) {
    console.error('Error during task filtering:', err);
    res.status(500).send('Failed to load tasks.');
  }
};


exports.getSearchPage = (req, res) => {
  if (!req.session.user_id) return res.redirect('/auth/login');
  res.render('search', {
    userName: req.session.userName || 'User',
    title: 'Search Tasks'
  });
};

exports.searchTasks = async (req, res) => {
  if (!req.session.user_id) return res.status(401).send('Unauthorized');

  const userId = req.session.user_id;
  const query = req.query.q || '';

  try {
    const tasks = await Task.search(userId, query);
    console.log(`Search for "${query}": found ${tasks.length} tasks`);

    // Render just the partial
    res.render('partials/tasksList', { tasks, layout: false });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Search failed');
  }
};
