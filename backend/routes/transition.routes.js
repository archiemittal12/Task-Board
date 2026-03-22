const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addTransition,
  removeTransition,
  getTransitions,
} = require('../services/transition.service');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', getTransitions);
router.post('/', addTransition);
router.delete('/', removeTransition);

module.exports = router;
