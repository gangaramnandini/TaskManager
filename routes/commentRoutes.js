const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/tasks/:task_id/comments/add', commentController.addComment);
router.post('/comments/:comment_id/edit', commentController.editComment);
router.post('/comments/:comment_id/delete', commentController.deleteComment);
router.get('/tasks/:task_id/comments/list', commentController.listComments);

module.exports = router;
