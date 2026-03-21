const prisma = require("../config/db");

// check membership
const checkProjectMembership = async (projectId, userId) => {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
        }
    }
  });
};

// check admin
const checkProjectAdmin = async (projectId, userId) => {
  const member = await checkProjectMembership(projectId, userId);
  if (!member) return null;
  if (member.role === "ADMIN") {
    return member;
  }
  return null;
};
// check write access (admin and editor have write access, viewer does not)
const checkProjectWriteAccess = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });

  if (!member) return null;

  if (member.role === "VIEWER") return null;

  return member;
};

module.exports = {
  checkProjectMembership,
  checkProjectAdmin,
  checkProjectWriteAccess
};
