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
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

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
    // check admin
    const isAdmin = await checkProjectAdmin(id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admins can delete project"
      });
    }
    await prisma.projectMember.deleteMany({
      where: { projectId: id }
    });
    await prisma.project.delete({
      where: { id }
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