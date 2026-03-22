const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createStory,
  getStoriesByProject,
  updateStory,
  deleteTask, // reuse same delete logic
} = require('../services/task.service');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post(
  '/',
  (req, res, next) => {
    req.body.projectId = req.params.projectId;
    next();
  },
  createStory
);

router.get('/', getStoriesByProject);
router.put('/:storyId', updateStory);
router.delete(
  '/:storyId',
  (req, res, next) => {
    req.params.taskId = req.params.storyId; // deleteTask reads taskId
    next();
  },
  deleteTask
);

module.exports = router;
