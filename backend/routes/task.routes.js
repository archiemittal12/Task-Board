const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createWorkItem,
  moveTask,
  getTaskById,
  updateTask,
  deleteTask
} = require("../services/task.service");
const { getActivity } = require("../services/comment.service");
const commentRoutes = require("./comment.routes");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", createWorkItem);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.patch("/:taskId/move", moveTask);
router.delete("/:taskId", deleteTask);

// activity timeline (comments + audit logs merged)
router.get("/:taskId/activity", getActivity);

// nested comment routes
router.use("/:taskId/comments", commentRoutes);

module.exports = router;