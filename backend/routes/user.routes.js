const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const prisma = require('../config/db');
const { checkGlobalAdmin } = require('../middleware/adminMiddleware');


router.get('/me', authMiddleware, async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      globalRole: req.user.globalRole,
      avatarUrl: req.user.avatarUrl,
    },
  });
});

// upload or update avatar
router.patch('/avatar', authMiddleware, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // store relative path — frontend can use this to display image
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl }
    });

    return res.status(200).json({
      success: true,
      avatarUrl: updated.avatarUrl
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


router.get('/all', authMiddleware, checkGlobalAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, username: true,
        email: true, globalRole: true,
        avatarUrl: true, createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:userId/role', authMiddleware, checkGlobalAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { globalRole } = req.body;

    if (!["ADMIN", "USER"].includes(globalRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot change your own global role" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { globalRole },
      select: { id: true, globalRole: true }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;