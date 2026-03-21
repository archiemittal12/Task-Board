const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams so we get taskId from parent
const {
  createComment,
  updateComment,
  deleteComment
} = require("../services/comment.service");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", createComment);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

module.exports = router;
