const prisma = require("../config/db");
const { checkProjectAdmin } = require("../utils/projectAuth");

const resolveProjectId = async (projectParam) => {
  // A simple way to check if it looks like a UUID (36 chars with dashes)
  const isUuid = projectParam.length === 36 && projectParam.includes('-');

  if (isUuid) {
    return projectParam; // It's already the ID we need
  }

  // It looks like a name. Let's find the ID.
  const project = await prisma.project.findFirst({
    where: { name: projectParam }
  });

  if (!project) {
    return null; // Project not found by this name
  }
  
  return project.id; // Return the actual UUID
};

// check if user is a global admin or project admin
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
    const { projectId: projectParam } = req.params;
    const { username, role } = req.body; 
    const requesterId = req.user.id;

    if (!username || !role) {
      return res.status(400).json({ success: false, message: "Username and role are required" });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be ADMIN, MEMBER, or VIEWER" });
    }

    // Resolve the project ID (UUID or Name)
    const projectId = await resolveProjectId(projectParam);
    if (!projectId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Only project admin can manage members" });
    }

    // Look up the user by their unique username
    const user = await prisma.user.findUnique({
      where: { username: username }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User with this username not found" });
    }

    const userId = user.id;

    // check not already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: "User is already a member of this project" });
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      select: { userId: true, role: true }
    });

    return res.status(201).json({ success: true, data: member });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId: projectParam, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.id;

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be ADMIN, MEMBER, or VIEWER" });
    }

    // Resolve the project ID
    const projectId = await resolveProjectId(projectParam);
    if (!projectId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Only project admin can manage members" });
    }

    // check member exists in project
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Member not found in this project" });
    }

    // prevent demoting the last admin
    if (existing.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" }
      });
      if (adminCount === 1) {
        return res.status(400).json({ success: false, message: "Cannot demote the last admin of a project" });
      }
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
      select: { userId: true, role: true }
    });

    return res.status(200).json({ success: true, data: updated });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// remove a member from project
const removeMember = async (req, res) => {
  try {
    const { projectId: projectParam, userId } = req.params;
    const requesterId = req.user.id;

    if (userId === requesterId) {
      return res.status(400).json({ success: false, message: "You cannot remove yourself from the project" });
    }

    // Resolve the project ID
    const projectId = await resolveProjectId(projectParam);
    if (!projectId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const allowed = await canManageMembers(projectId, requesterId);
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Only project admin can manage members" });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Member not found in this project" });
    }

    // prevent removing the last admin
    if (existing.role === "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" }
      });
      if (adminCount === 1) {
        return res.status(400).json({ success: false, message: "Cannot remove the last admin of a project" });
      }
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });

    return res.status(200).json({ success: true, message: "Member removed successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all members of a project
const getMembers = async (req, res) => {
  try {
    const { projectId: projectParam } = req.params;
    const userId = req.user.id;

    // Resolve the project ID
    const projectId = await resolveProjectId(projectParam);
    if (!projectId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user is global admin OR a project member
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isGlobalAdmin = user?.globalRole === "ADMIN";

    if (!isGlobalAdmin) {
      const existing = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
      });
      if (!existing) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true, role: true }
    });

    return res.status(200).json({ success: true, data: members });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addMember,
  updateMemberRole,
  removeMember,
  getMembers
};