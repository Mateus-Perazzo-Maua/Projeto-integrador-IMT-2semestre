const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

router.post('/api/generate-image', imageController.generateImage);
router.get('/api/status', imageController.getStatus);

module.exports = router;