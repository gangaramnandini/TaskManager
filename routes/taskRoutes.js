const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

const { ensureAuthenticated } = require('../middleware/auth');

// Protect routes
router.use(ensureAuthenticated);

// Get all tasks for logged-in user
router.get('/tasks', taskController.getAllTasks);

// Show add task form
router.get('/tasks/add', taskController.getAddTaskPage);

// Submit new task
router.post('/tasks/add', taskController.addTask);

// Show edit task form
router.get('/tasks/:id/edit', taskController.getEditTaskPage);

// Submit task edit
router.post('/tasks/:id/edit', taskController.editTask);

// Delete task
router.post('/tasks/:id/delete', taskController.deleteTask);

// Toggle Status (Sync)
router.post('/tasks/:id/toggle', taskController.toggleStatusSync);

// Search API (AJAX) - MUST be before /tasks/:id
router.get('/tasks/search', taskController.searchTasks);

router.get('/tasks/filter', taskController.getFilteredTasksPartial);

router.get('/tasks/:task_id', taskController.getTaskDetails);

// Search Page
router.get('/search', taskController.getSearchPage);

// Get filtered tasks (AJAX)
// router.get('/tasks/filter', taskController.getFilteredTasks);


module.exports = router;
