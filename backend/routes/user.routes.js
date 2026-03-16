const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
router.get('/me', authMiddleware, async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      globalRole: req.user.globalRole,
    },
  });
});
module.exports = router;