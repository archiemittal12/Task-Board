const express = require("express");
const router = express.Router({ mergeParams: true });
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
module.exports = router;