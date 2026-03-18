const express = require("express");
const router = express.Router({ mergeParams: true });
const columnRoutes = require("./column.routes");
const {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard
} = require("../services/board.service");
router.post("/", createBoard);
router.get("/", getBoards);
router.put("/:boardId", updateBoard);
router.delete("/:boardId", deleteBoard);
router.use("/:boardId/columns", columnRoutes);
module.exports = router;