const prisma = require("../config/db");
const {
  checkProjectMembership,
  checkProjectAdmin
} = require("../utils/projectAuth");


// create board (only admin(global and project) can create)
const createBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    //Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    //Check admin
    const admin = await checkProjectAdmin(projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can create board"
      });
    }

    //]Unique name check(board name should be unique within the project)
    const existingBoard = await prisma.board.findFirst({
      where: {
        projectId,
        name
      }
    });

    if (existingBoard) {
      return res.status(400).json({
        success: false,
        message: "Board with this name already exists"
      });
    }

    //Create board
    const board = await prisma.board.create({
      data: {
        name,
        projectId
      }
    });

    return res.status(201).json({
      success: true,
      data: board,
      message: "Board created successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



//get boards of a project (only members can access)
const getBoards = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    //Check membership
    const member = await checkProjectMembership(projectId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    //Fetch boards
    const boards = await prisma.board.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: boards
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



//update board (only admin(global and project) can update)
const updateBoard = async (req, res) => {
  try {
   const { boardId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;
    //get board
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    //Check admin
    const admin = await checkProjectAdmin(board.projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can update board"
      });
    }

    //Unique name check
    const existing = await prisma.board.findFirst({
      where: {
        projectId: board.projectId,
        name
      }
    });

    if (existing && existing.id !== id) {
      return res.status(400).json({
        success: false,
        message: "Board name already exists"
      });
    }

    //Update
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { name }
    });

    return res.status(200).json({
      success: true,
      data: updatedBoard,
      message: "Board updated successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



//delete board (only admin(global and project) can delete)
const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;
    //get board
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }
    //check admin
    const admin = await checkProjectAdmin(board.projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can delete board"
      });
    }
    //delete
    await prisma.board.delete({
      where: { id: boardId }
    });
    return res.status(200).json({
      success: true,
      message: "Board deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
module.exports = {
    createBoard,
    getBoards,
    updateBoard,
    deleteBoard
};