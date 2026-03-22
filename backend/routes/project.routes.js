const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../services/project.service');
const authMiddleware = require('../middleware/auth.middleware');
const boardRoutes = require('./board.routes');
const storyRoutes = require('./story.routes');
const memberRoutes = require('./member.routes');
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.globalRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const projects = await prisma.project.findMany({
      include: { members: { select: { userId: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: projects });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.use(authMiddleware);

// project APIs
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// nested board routes
router.use('/:projectId/boards', boardRoutes);
router.use('/:projectId/stories', storyRoutes);
router.use('/:projectId/members', memberRoutes);

module.exports = router;
