const express = require('express');
const resultController = require('../controllers/result.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// GET /api/results/my - Lấy kết quả học tập của bản thân
router.get('/my', resultController.getMyResults);

// GET /api/results/stats - Lấy thống kê tích lũy
router.get('/stats', resultController.getMyResultStats);

module.exports = router;
