const prisma = require('../config/db');
const { 
  checkProjectMembership, // this is to check whether the user is a member of the project (for GET /projects/:id)
  checkProjectAdmin // this is to check whether the user is an admin of the project (for UPDATE & DELETE /projects/:id)
} = require("../utils/projectAuth");


// creating a project(creator is automatically added as admin)
const createProject = async (req, res) => {
  try {
    const {name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        error: "Project name is required"
      });
    }
    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN"
          }
        }
      },
      include: {
        members: true
      }
    });

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create project"
    });
  }
};

// get all projects of user (can be member or admin)
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        boards: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch projects"
    });
  }
};



// get project by id 
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    // check membership
    const membership = await checkProjectMembership(id, req.user.id);
    if (!membership) {
      return res.status(403).json({
        error: "Access denied"
      });
    }
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        boards: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    if (!project) {
      return res.status(404).json({
        error: "Project not found"
      });
    }
    return res.status(200).json({
      project
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch project"
    });
  }
};



//update project (only admin can update)
// backend/services/project.service.js

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Destructure isArchived from req.body
    const { name, description, isArchived } = req.body; 

    // check admin
    const isAdmin = await checkProjectAdmin(id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admins can update project"
      });
    }
    
    const data = {};
    if (name !== undefined) {
      data.name = name;
    }
    if (description !== undefined) {
      data.description = description;
    }
    // 2. Add isArchived to the update data if provided
    if (isArchived !== undefined) {
      data.isArchived = isArchived;
    }

    const project = await prisma.project.update({
      where: { id },
      data
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to update project"
    });
  }
};



// delete project (only admin can delete)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = await checkProjectAdmin(id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admins can delete project"
      });
    }
    await prisma.$transaction(async (tx) => {
      // get all task ids in this project first
      const tasks = await tx.task.findMany({
        where: { projectId: id },
        select: { id: true }
      });
      const taskIds = tasks.map((t) => t.id);
      // delete mentions, comments, audits first
      await tx.mention.deleteMany({ where: { comment: { taskId: { in: taskIds } } } });
      await tx.comment.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.taskAudit.deleteMany({ where: { taskId: { in: taskIds } } });

      // delete tasks first because of foreign key constraint

      await tx.task.deleteMany({
        where: { projectId: id }
      });
      // delete columns
      await tx.column.deleteMany({
        where: {
          board: {
            projectId: id
          }
        }
      });
      // delete boards
      await tx.board.deleteMany({
        where: { projectId: id }
      });
      // delete members
      await tx.projectMember.deleteMany({
        where: { projectId: id }
      });
      // finally delete project
      await tx.project.delete({
        where: { id }
      });
    });
    return res.status(200).json({
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to delete project"
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};