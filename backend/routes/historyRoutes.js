const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.post('/api/save-history', historyController.saveHistory);
router.post('/api/history', historyController.getHistory);
router.post('/api/stats', historyController.getStats);

module.exports = router;