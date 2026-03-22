const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

router.post('/register', authService.register);
router.post('/login', authService.login);
router.post('/refresh', authService.refresh);
router.post('/logout', authService.logout);

module.exports = router;