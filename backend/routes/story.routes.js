const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createStory,
  getStoriesByProject,
  updateStory
} = require("../services/task.service");
const authMiddleware = require("../middleware/auth.middleware");
router.use(authMiddleware);
router.post("/", (req, res, next) => {
  req.body.projectId = req.params.projectId;
  next();
}, createStory);
router.get("/", getStoriesByProject);
router.put("/:storyId", updateStory);
module.exports = router;
