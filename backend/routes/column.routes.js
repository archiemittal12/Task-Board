const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn
} = require("../services/column.service");
const taskRoutes = require("./task.routes");

const authMiddleware = require("../middleware/auth.middleware");
router.use(authMiddleware);
router.post("/", createColumn);
router.get("/", getColumnsByBoard);
router.put("/:columnId", updateColumn);
router.delete("/:columnId", deleteColumn);
router.use("/:columnId/tasks", taskRoutes);

module.exports = router;
