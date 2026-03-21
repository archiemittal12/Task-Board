const prisma = require("../config/db");
const { checkProjectAdmin } = require("../utils/projectAuth");


// check if user is a global admin or project admin,global admin can manage any project's members without being a project admin
const canManageMembers = async (projectId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { globalRole: true }
  });

  if (user?.globalRole === "ADMIN") return true;

  const projectAdmin = await checkProjectAdmin(projectId, userId);
  return !!projectAdmin;
};


// add a member to a project
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const requesterId = req.user.id;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "userId and role are required"
      });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be ADMIN, MEMBER, or VIEWER"
      });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can manage members"
      });
    }

    // check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // check not already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project"
      });
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      select: { userId: true, role: true }
    });

    return res.status(201).json({
      success: true,
      data: member
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.id;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be ADMIN, MEMBER, or VIEWER"
      });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can manage members"
      });
    }

    // check member exists in project
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project"
      });
    }

    // prevent demoting the last admin
    if (existing.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" }
      });
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last admin of a project"
        });
      }
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
      select: { userId: true, role: true }
    });

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// remove a member from project
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const requesterId = req.user.id;

    // cannot remove yourself
    if (userId === requesterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself from the project"
      });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Only project admin can manage members"
      });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project"
      });
    }

    // prevent removing the last admin
    if (existing.role === "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" }
      });
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin of a project"
        });
      }
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// get all members of a project
// any project member can view the list
const getMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!existing) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true, role: true }
    });

    return res.status(200).json({
      success: true,
      data: members
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
  addMember,
  updateMemberRole,
  removeMember,
  getMembers
};
