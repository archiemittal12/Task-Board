const prisma = require('../config/db');
const { checkProjectMembership, checkProjectAdmin } = require('../utils/projectAuth');

// helper to verify board belongs to project and get boardId
const getBoard = async (boardId, projectId) => {
  return await prisma.board.findFirst({
    where: { id: boardId, projectId },
  });
};

// helper to check column belongs to board
const getColumn = async (columnId, boardId) => {
  return await prisma.column.findFirst({
    where: { id: columnId, boardId },
  });
};

// add a transition rule (only project admin)
const addTransition = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const { fromColumnId, toColumnId } = req.body;
    const userId = req.user.id;

    if (!fromColumnId || !toColumnId) {
      return res.status(400).json({
        success: false,
        message: 'fromColumnId and toColumnId are required',
      });
    }

    // only admin can define transition rules
    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can define transition rules',
      });
    }

    // check board belongs to project
    const board = await getBoard(boardId, projectId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // check both columns belong to this board
    const fromColumn = await getColumn(fromColumnId, boardId);
    if (!fromColumn) {
      return res.status(404).json({
        success: false,
        message: 'fromColumn not found in this board',
      });
    }

    const toColumn = await getColumn(toColumnId, boardId);
    if (!toColumn) {
      return res.status(404).json({
        success: false,
        message: 'toColumn not found in this board',
      });
    }

    // check rule doesn't already exist
    const existing = await prisma.columnTransition.findUnique({
      where: {
        fromColumnId_toColumnId: { fromColumnId, toColumnId },
      },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Transition rule already exists',
      });
    }

    const transition = await prisma.columnTransition.create({
      data: { boardId, fromColumnId, toColumnId },
    });

    return res.status(201).json({
      success: true,
      data: transition,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// remove a transition rule (only project admin)
const removeTransition = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const { fromColumnId, toColumnId } = req.body;
    const userId = req.user.id;

    if (!fromColumnId || !toColumnId) {
      return res.status(400).json({
        success: false,
        message: 'fromColumnId and toColumnId are required',
      });
    }

    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can manage transition rules',
      });
    }

    const board = await getBoard(boardId, projectId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const existing = await prisma.columnTransition.findFirst({
      where: { boardId, fromColumnId, toColumnId },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transition rule not found',
      });
    }

    // after
    await prisma.columnTransition.deleteMany({
      where: { boardId, fromColumnId, toColumnId },
    });

    return res.status(200).json({
      success: true,
      message: 'Transition rule removed',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// get all transition rules for a board (any project member can view)
const getTransitions = async (req, res) => {
  try {
    const { projectId, boardId } = req.params;
    const userId = req.user.id;

    const member = await checkProjectMembership(projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const board = await getBoard(boardId, projectId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const transitions = await prisma.columnTransition.findMany({
      where: { boardId },
    });

    return res.status(200).json({
      success: true,
      data: transitions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  addTransition,
  removeTransition,
  getTransitions,
};
