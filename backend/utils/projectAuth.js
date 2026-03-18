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

module.exports = {
  checkProjectMembership,
  checkProjectAdmin
};