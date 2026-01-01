const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfilePage);
router.post('/profile/update', userController.updateProfile);
router.post('/profile/password', userController.changePassword);

module.exports = router;
