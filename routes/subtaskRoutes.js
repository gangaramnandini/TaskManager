const express = require('express');
const router = express.Router();
const subtaskController = require('../controllers/subtaskController');

router.post('/tasks/:task_id/subtasks/add', subtaskController.addSubtask);
router.post('/subtasks/:subtask_id/delete', subtaskController.deleteSubtask);
router.post('/subtasks/:subtask_id/toggle', subtaskController.toggleSubtaskStatus);
router.post('/subtasks/:subtask_id/edit', subtaskController.editSubtask); // Optional
router.get('/tasks/:task_id/subtasks/list', subtaskController.listSubtasksForTask); // For AJAX refresh

module.exports = router;
