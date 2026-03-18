const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn
} = require("../services/column.service");

const authMiddleware = require("../middleware/auth.middleware");
router.use(authMiddleware);
router.post("/", createColumn);
router.get("/", getColumnsByBoard);
router.put("/:columnId", updateColumn);
router.delete("/:columnId", deleteColumn);

module.exports = router;