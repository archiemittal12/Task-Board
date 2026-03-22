const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../services/notification.service');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
