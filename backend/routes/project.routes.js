const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../services/project.service");
const authMiddleware = require("../middleware/auth.middleware");
const boardRoutes = require("./board.routes");
router.use(authMiddleware);

// project APIs
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// nested board routes
router.use("/:projectId/boards", boardRoutes);

module.exports = router;