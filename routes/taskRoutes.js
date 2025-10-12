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

router.post('/tasks/:id/toggle-ajax', taskController.toggleStatusAjax);


router.get('/tasks/:task_id', taskController.getTaskDetails);

// router.get('/tasks/:task_id', taskController.getTaskDetails);


module.exports = router;
