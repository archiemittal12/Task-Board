const prisma = require("../config/db");
const {
  checkProjectMembership,
  checkProjectAdmin
} = require("../utils/projectAuth");


// this is to avoid duplicate column names that are visually similar (e.g. "To Do" vs "to do")
const normalizeName = (name) => name.trim().toLowerCase();


//helper to get board and validate existence
const getBoard= async (boardId) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, projectId: true }
  });

  if (!board) {
    throw new Error("Board not found");
  }
  return board;
};


//Validate column belongs to board 
const getColumnInBoard = async (columnId, boardId) => {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      boardId
    }
  });
  if (!column) {
    throw new Error("Target column not found in this board");
  }
  return column;
};


//i am using sparse ordering with gaps (100, 200, 300), now when gap is small we have to rebalance positions to create more space. This is a common technique to maintain O(1) insertions without needing to update many rows on every insert.
const rebalanceColumns = async (boardId) => {
  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { position: "asc" }
  });
  const updates = columns.map((col, index) =>
    prisma.column.update({
      where: { id: col.id },
      data: { position: (index + 1) * 100 }
    })
  );
  await prisma.$transaction(updates);
};


//
const calculatePosition = async ({
  boardId,
  beforeColumnId,
  afterColumnId
}) => {
  const MIN_GAP = 10;

  // CASE 1 — BEFORE
  if (beforeColumnId) {
    const target = await getColumnInBoard(beforeColumnId, boardId);
    const prev = await prisma.column.findFirst({
      where: {
        boardId,
        position: { lt: target.position }
      },
      orderBy: { position: "desc" }
    });
    if (!prev) return target.position - 100;
    const gap = target.position - prev.position;
    if (gap < MIN_GAP) {
      await rebalanceColumns(boardId);
      return calculatePosition({ boardId, beforeColumnId });
    }
    return (prev.position + target.position) / 2;
  }

  // CASE 2 — AFTER
  if (afterColumnId) {
    const target = await getColumnInBoard(afterColumnId, boardId);

    const next = await prisma.column.findFirst({
      where: {
        boardId,
        position: { gt: target.position }
      },
      orderBy: { position: "asc" }
    });
    if (!next) return target.position + 100;
    const gap = next.position - target.position;
    if (gap < MIN_GAP) {
      await rebalanceColumns(boardId);
      return calculatePosition({ boardId, afterColumnId });
    }
    return (target.position + next.position) / 2;
  }

  // CASE 3 — APPEND
  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" }
  });

  return last ? last.position + 100 : 100;
};


// 🔹 CREATE COLUMN (FINAL)
const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, wipLimit, beforeColumnId, afterColumnId } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Column name is required"
      });
    }

    // 🔹 Get board
    const board = await getBoardOrThrow(boardId);

    // 🔹 Auth
    await checkProjectMembership(userId, board.projectId);
    await checkProjectAdmin(userId, board.projectId);

    // 🔹 Human-friendly duplicate check
    const existingColumns = await prisma.column.findMany({
      where: { boardId },
      select: { name: true }
    });

    const isDuplicate = existingColumns.some(
      (col) => normalizeName(col.name) === normalizeName(name)
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: "A column with a similar name already exists in this board"
      });
    }

    // 🔹 Calculate position (safe)
    let position;
    try {
      position = await calculatePosition({
        boardId,
        beforeColumnId,
        afterColumnId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // 🔹 Create
    const column = await prisma.column.create({
      data: {
        name: name.trim(),
        position,
        wipLimit,
        boardId
      }
    });

    return res.status(201).json({
      success: true,
      data: column
    });

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Column name must be unique within the board"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 🔹 GET COLUMNS
const getColumnsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true }
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    await checkProjectMembership(userId, board.projectId);

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { position: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: columns
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 🔹 UPDATE COLUMN
const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, wipLimit } = req.body;
    const userId = req.user.id;

    const column = await prisma.column.findUnique({
      where: { id },
      include: {
        board: {
          select: { projectId: true }
        }
      }
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    const projectId = column.board.projectId;

    await checkProjectMembership(userId, projectId);
    await checkProjectAdmin(userId, projectId);

    const updated = await prisma.column.update({
      where: { id },
      data: {
        name: name ?? column.name,
        position: position ?? column.position,
        wipLimit: wipLimit ?? column.wipLimit
      }
    });

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 🔹 DELETE COLUMN
const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const column = await prisma.column.findUnique({
      where: { id },
      include: {
        board: {
          select: { projectId: true }
        },
        tasks: {
          select: { id: true }
        }
      }
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    const projectId = column.board.projectId;

    await checkProjectMembership(userId, projectId);
    await checkProjectAdmin(userId, projectId);

    // Restrict delete if tasks exist
    if (column.tasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete column with existing tasks"
      });
    }

    await prisma.column.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Column deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn
};