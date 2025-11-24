const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/api/user-info', userController.getUserInfo);
router.put('/api/update-user', userController.updateUser);
router.put('/api/update-password', userController.updatePassword);
router.delete('/api/delete-account', userController.deleteAccount);
router.post('/api/user-profile', userController.getUserProfile);

module.exports = router;