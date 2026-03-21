const prisma = require("../config/db");
const {
  checkProjectMembership,
  checkProjectAdmin,
  checkProjectWriteAccess
} = require("../utils/projectAuth");


// ─── Helpers ────────────────────────────────────────────────────────────────

// parse all @username tokens from comment content
const parseMentions = (content) => {
  const regex = /@(\w+)/g;
  const names = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1].toLowerCase()); // normalize to match stored username casing
  }
  return [...new Set(names)]; // deduplicate
};


// resolve usernames → users who are actually members of this project
// queries by username (unique field) — name is not unique so cannot be used
// silently ignores outsiders and unrecognised usernames
const resolveMentionedMembers = async (usernames, projectId) => {
  if (usernames.length === 0) return [];

  const users = await prisma.user.findMany({
    where: {
      username: { in: usernames },   // ← was name, fixed to username
      projects: {
        some: { projectId }
      }
    },
    select: { id: true, username: true }
  });

  return users;
};


// small wrapper to keep audit log creation clean at call sites
const logAudit = async (tx, { taskId, field, oldValue, newValue, userId }) => {
  await tx.taskAudit.create({
    data: { taskId, field, oldValue, newValue, userId }
  });
};


// ─── Create Comment ──────────────────────────────────────────────────────────

const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const member = await checkProjectWriteAccess(task.projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    // parse @mentions and resolve to real project members
    const mentionedUsernames = parseMentions(content);
    const mentionedUsers = await resolveMentionedMembers(mentionedUsernames, task.projectId);

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content: content.trim(),
          taskId,
          userId
        }
      });

      // store mention records
      if (mentionedUsers.length > 0) {
        await tx.mention.createMany({
          data: mentionedUsers.map((u) => ({
            commentId: newComment.id,
            userId: u.id
          }))
        });

        // notify every mentioned user
        await tx.notification.createMany({
          data: mentionedUsers.map((u) => ({
            userId: u.id,
            type: "USER_MENTIONED",
            message: `You were mentioned in a comment on task: "${task.title}"`
          }))
        });
      }

      await logAudit(tx, {
        taskId,
        field: "comment",
        oldValue: null,
        newValue: content.trim(),
        userId
      });
      // notify assignee and reporter about the new comment,skip if they are the one who made the comment
      const notifyUserIds = [task.assigneeId, task.reporterId]
        .filter((id) => id && id !== userId);
        
      // deduplicate in case assignee and reporter are same person
      const uniqueUserIds = [...new Set(notifyUserIds)];

      if (uniqueUserIds.length > 0) {
        await tx.notification.createMany({
          data: uniqueUserIds.map((id) => ({
            userId: id,
            type: "COMMENT_ADDED",
            message: `A new comment was added on task: "${task.title}"`
          }))
        });
      }
      return newComment;
    });


    return res.status(201).json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// ─── Update Comment ───────────────────────────────────────────────────────────

const updateComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.taskId !== taskId) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // need task for projectId and notification message
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, title: true }
    });

    // verify user still has write access to this project
    // (catches removed members and viewers who were downgraded)
    const member = await checkProjectWriteAccess(task.projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    // only own comment can be edited (even admins cannot edit others' comments)
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments"
      });
    }

    // diff mentions: only notify users who are newly mentioned
    const oldUsernames = parseMentions(comment.content);
    const newUsernames = parseMentions(content);
    const addedUsernames = newUsernames.filter((u) => !oldUsernames.includes(u));

    const allMentionedUsers = await resolveMentionedMembers(newUsernames, task.projectId);
    const newlyMentionedUsers = await resolveMentionedMembers(addedUsernames, task.projectId);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedComment = await tx.comment.update({
        where: { id: commentId },
        data: { content: content.trim() }
      });

      // rebuild mention records from scratch (simplest correct approach)
      await tx.mention.deleteMany({ where: { commentId } });

      if (allMentionedUsers.length > 0) {
        await tx.mention.createMany({
          data: allMentionedUsers.map((u) => ({
            commentId,
            userId: u.id
          }))
        });
      }

      // notify only the newly added mentions
      if (newlyMentionedUsers.length > 0) {
        await tx.notification.createMany({
          data: newlyMentionedUsers.map((u) => ({
            userId: u.id,
            type: "USER_MENTIONED",
            message: `You were mentioned in a comment on task: "${task.title}"`
          }))
        });
      }

      await logAudit(tx, {
        taskId,
        field: "comment",
        oldValue: comment.content,
        newValue: content.trim(),
        userId
      });

      return updatedComment;
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


// ─── Delete Comment ───────────────────────────────────────────────────────────

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.taskId !== taskId) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true }
    });

    // verify user still has write access (membership + not a viewer)
    // consistent with createComment and updateComment which both require write access
    const writeAccess = await checkProjectWriteAccess(task.projectId, userId);
    if (!writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const isOwner = comment.userId === userId;

    if (!isOwner) {
      // only project admin can delete someone else's comment
      const admin = await checkProjectAdmin(task.projectId, userId);
      if (!admin) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own comments"
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      // cascade delete mentions first (no onDelete cascade in schema)
      await tx.mention.deleteMany({ where: { commentId } });

      await logAudit(tx, {
        taskId,
        field: "comment",
        oldValue: comment.content,
        newValue: null,
        userId
      });

      await tx.comment.delete({ where: { id: commentId } });
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Activity Timeline

// returns comments and audit logs merged and sorted by createdAt
const getActivity = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // viewers can read activity — just membership check
    const member = await checkProjectMembership(task.projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const [comments, auditLogs] = await Promise.all([
      prisma.comment.findMany({
        where: { taskId },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          mentions: {
            include: {
              user: { select: { id: true, name: true, username: true } }
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.taskAudit.findMany({
        where: { taskId },
        orderBy: { createdAt: "asc" }
      })
    ]);

    const activity = [
      ...comments.map((c) => ({ type: "comment", createdAt: c.createdAt, data: c })),
      ...auditLogs.map((a) => ({ type: "audit",   createdAt: a.createdAt, data: a }))
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.status(200).json({
      success: true,
      data: activity
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
  createComment,
  updateComment,
  deleteComment,
  getActivity
};