const prisma = require("../config/db");
const {
  checkProjectMembership,
  checkProjectAdmin
} = require("../utils/projectAuth");


// this is to avoid duplicate column names that are visually similar (e.g. "To Do" vs "to do")
const ensureUniqueColumnName = async (boardId, name, excludeId = null) => {
  const normalizeName = (n) => n.trim().toLowerCase();
  const columns = await prisma.column.findMany({
    where: { boardId },
    select: { id: true, name: true }
  });
  const isDuplicate = columns.some(
    (col) =>
      col.id !== excludeId &&
      normalizeName(col.name) === normalizeName(name)
  );
  if (isDuplicate) {
    throw new Error("A column with a similar name already exists in this board");
  }
};


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

  //if both before and after are provided, we prioritize before for better UX (dragging between two columns)
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
   return prev.position + Math.floor((target.position - prev.position) / 2);
  }

  //if after is provided without before, we append after that column
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
    return target.position + Math.floor((next.position - target.position) / 2);
  }

  // if neither before nor after is provided, we append to the end of the board
  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" }
  });

  return last ? last.position + 100 : 100;
};
// recalculate and update story status based on children's statuses
const updateStoryStatus = async (storyId) => {
  const children = await prisma.task.findMany({
    where: { parentId: storyId },
    select: { status: true }
  });

  // no children — keep as TODO
  if (children.length === 0) {
    await prisma.task.update({
      where: { id: storyId },
      data: { status: "TODO" }
    });
    return;
  }

  const allDone = children.every((c) => c.status === "DONE");
  const allReview = children.every((c) => c.status === "REVIEW");
  const allTodo = children.every((c) => c.status === "TODO");

  let storyStatus;
  if (allDone) storyStatus = "DONE";
  else if (allReview) storyStatus = "REVIEW";
  else if (allTodo) storyStatus = "TODO";
  else storyStatus = "IN_PROGRESS";

  await prisma.task.update({
    where: { id: storyId },
    data: { status: storyStatus }
  });
};

//create column (only admin(global and project) can create)
const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, wipLimit, beforeColumnId, afterColumnId, status } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
    return res.status(400).json({
        success: false,
        message: "Name is required"
    });
    }
    // status is required and must be a valid TaskStatus
    if (status || !["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (TODO, IN_PROGRESS, REVIEW, DONE)"
      });
    }
    //Get board
    let board;
        try {
          board = await getBoard(boardId);
        } catch (err) {
          return res.status(404).json({
            success: false,
            message: err.message
          });
        }
    const projectId = board.projectId;
    const member = await checkProjectMembership(projectId, userId);
    if (!member) {
    return res.status(403).json({
        success: false,
        message: "You are not a member of this project"
    });
    }

    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
    return res.status(403).json({
        success: false,
        message: "Only project admin can perform this action"
    });
    }
    if (name !== undefined) {
      try {
            await ensureUniqueColumnName(boardId, name);
          } catch (err) {
            return res.status(400).json({
              success: false,
              message: err.message
            });
          }
    }
    if (wipLimit !== undefined && wipLimit !== null) {
      if (!Number.isInteger(wipLimit) || wipLimit < 1) {
        return res.status(400).json({
          success: false,
          message: "WIP limit must be a positive integer"
        });
      }
    }

    //Calculate position
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

    //Create
    const column = await prisma.column.create({
      data: {
        name: name.trim(),
        position,
        wipLimit,
        boardId,
        status: status ?? "TODO"
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


//get columns by board (only project members can view)
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

    const member = await checkProjectMembership(board.projectId, userId);
    if (!member) {
    return res.status(403).json({
        success: false,
        message: "You are not a member of this project"
    });
    }

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


//update column (only admin(global and project) can update)
const updateColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { name, position, wipLimit, status } = req.body;
    const userId = req.user.id;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
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

    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can perform this action"
      });
    }
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Column name cannot be empty"
        });
      }
    }  
    if (name !== undefined) {
     try {
          await ensureUniqueColumnName(column.boardId, name, columnId);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
    }
    if (wipLimit !== undefined && wipLimit !== null) {
      if (!Number.isInteger(wipLimit) || wipLimit < 1) {
        return res.status(400).json({
          success: false,
          message: "WIP limit must be a positive integer"
        });
      }
    }
    if (status && !["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }
    const updated = await prisma.column.update({
      where: { id: columnId },
      data: {
        name: name !== undefined ? name.trim() : column.name,
        position: position ?? column.position,
        wipLimit: wipLimit ?? column.wipLimit,
        status: status ?? column.status
      }
    });
    // if status changed, update all tasks in this column
    if (status && status !== column.status) {
      await prisma.task.updateMany({
        where: { columnId },
        data: { status }
      });

      // recalculate story status for all affected stories
      const affectedTasks = await prisma.task.findMany({
        where: { columnId },
        select: { parentId: true }
      });
      const storyIds = [...new Set(
        affectedTasks.filter((t) => t.parentId).map((t) => t.parentId)
      )];
      for (const storyId of storyIds) {
        await updateStoryStatus(storyId);
      }
    }

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


//delete column (only admin(global and project) can delete)
const deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const userId = req.user.id;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
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
    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can perform this action"
      });
    }

    // Restrict delete if tasks exist
    if (column.tasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete column with existing tasks"
      });
    }
    // clean up transition rules involving this column
    await prisma.$transaction(async (tx) => {
      await tx.columnTransition.deleteMany({
        where: {
          OR: [
            { fromColumnId: columnId },
            { toColumnId: columnId }
          ]
        }
      });
      await tx.column.delete({
        where: { id: columnId }
      });
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