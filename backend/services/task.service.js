const prisma = require("../config/db");
const {
  checkProjectMembership,
  checkProjectAdmin,
  checkProjectWriteAccess
} = require("../utils/projectAuth");


// these are the helpers functions that will be used in multiple places, so we keep them here to avoid duplication

// get column + project
const getColumn = async (columnId) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: {
        select: { projectId: true }
      }
    }
  });
  return column;// even if it is null , we will take care of it later in the service function, we just want to keep the logic of fetching column and project together
};

// WIP limit check
const checkWipLimit = async (columnId) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { wipLimit: true }
  });

  if (!column) return null;// no need , as before running this function we will check whether column exist or not, but just to be safe we can keep this check here as well
  if(column.wipLimit === null) return true;// if wip limit is not set, then we can allow unlimited tasks
  const count = await prisma.task.count({
      where: { columnId }
    });
  return count < column.wipLimit;
};

// get last position
const getLastPosition = async (columnId) => {
  const last = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { position: "desc" }
  });

  return last ? last.position + 100 : 100;
};


// rebalance (same idea as columns)(here also we are using sparse ordering , only difference is that in creating task we are appending at end )
const rebalanceTasks = async (columnId) => {
  const tasks = await prisma.task.findMany({
    where: { columnId },
    orderBy: { position: "asc" }
  });
  const updates = tasks.map((t, idx) =>
    prisma.task.update({
      where: { id: t.id },
      data: { position: (idx + 1) * 100 }
    })
  );
  await prisma.$transaction(updates);
};


// calculate position (same pattern as columns)
const calculatePosition = async ({
  columnId,
  beforeTaskId,
  afterTaskId
}) => {
  const MIN_GAP = 10;

  if (beforeTaskId) {
    const target = await prisma.task.findUnique({
      where: { id: beforeTaskId }
    });

    if (!target || target.columnId !== columnId) {
      return null;
    }

    const prev = await prisma.task.findFirst({
      where: {
        columnId,
        position: { lt: target.position }
      },
      orderBy: { position: "desc" }
    });

    if (!prev) return target.position - 100;

    const gap = target.position - prev.position;

    if (gap < MIN_GAP) {
      await rebalanceTasks(columnId);
      return calculatePosition({ columnId, beforeTaskId });
    }

    return prev.position + Math.floor(( target.position - prev.position) / 2);
  }

  if (afterTaskId) {
    const target = await prisma.task.findUnique({
      where: { id: afterTaskId }
    });

    if (!target || target.columnId !== columnId) {
      return null;
    }

    const next = await prisma.task.findFirst({
      where: {
        columnId,
        position: { gt: target.position }
      },
      orderBy: { position: "asc" }
    });

    if (!next) return target.position + 100;

    const gap = next.position - target.position;

    if (gap < MIN_GAP) {
      await rebalanceTasks(columnId);
      return calculatePosition({ columnId, afterTaskId });
    }

    return target.position + Math.floor((next.position - target.position) / 2);
  }

  // fallback → append
  return getLastPosition(columnId);
};

const logAudit = async ({ taskId, field, oldValue, newValue, userId }) => {
  await prisma.taskAudit.create({
    data: { taskId, field, oldValue, newValue, userId }
  });
};

// this function will create a story, it is separate from createTask because story has different rules than task and bug
const createStory = async (req, res) => {
  try {
    const { title, description, projectId, priority, dueDate } = req.body;
    const userId = req.user.id;

    //  validation 
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "ProjectId is required"
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }
    if (!priority || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Valid priority is required"
        });
    }
    if (dueDate && isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
            success: false,
            message: "Invalid due date"
        });
    }

    // check for  project existence 
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    //  auth (ony project member with write access can create story)
    const member = await checkProjectWriteAccess(projectId, userId);
    if (!member) {
        
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    // create story (story will not belong to any column, it will be like a parent task, and task and bug will belong to story, we are not allowing subtask under subtask for simplicity, so only one level of nesting)
   const story = await prisma.task.create({
        data: {
            title: title.trim(),
            description,
            priority,
            dueDate,
            type: "STORY",
            projectId,
            columnId: null,
            parentId: null,
            reporterId: userId,
            position: null
        }
  });

    return res.status(201).json({
      success: true,
      data: story
    });

  } catch (error) {
    console.error(error);   
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
// create work item (we are allowing to create task and bug under a story, but not allowing to create subtask under another subtask for simplicity, so parent can only be a story, and story cannot have parent)
const createWorkItem = async (req, res) => {
  try {
    const { columnId } = req.params;
    const {
      title,
      description,
      priority,
      dueDate,
      assigneeId,
      parentId
    } = req.body;

    const { type = "TASK" } = req.body;
    const userId = req.user.id;

    //  type validation
    if (!["TASK", "BUG"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type"
      });
    }

    //  title validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    // parent validation (for task and bug, parent is required and it must be a story, and it must belong to same project)
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Task/Bug must belong to a story"
      });
    }

    // column validation (column is required and it must exist, we will also get projectId from column for auth and parent validation)
    if (!columnId) {
      return res.status(400).json({
        success: false,
        message: "Column is required"
      });
    }

    const column = await getColumn(columnId);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    const projectId = column.board.projectId;

    // ===== auth =====
    const member = await checkProjectWriteAccess(projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    // ===== parent validation =====
    const parent = await prisma.task.findUnique({
      where: { id: parentId }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found"
      });
    }

    if (parent.projectId !== projectId) {
      return res.status(400).json({
        success: false,
        message: "Parent must belong to same project"
      });
    }

    if (parent.type !== "STORY") {
      return res.status(400).json({
        success: false,
        message: "Parent must be a STORY"
      });
    }

    // ===== priority =====
    if (!priority || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Valid priority is required"
        });
    }
    // ===== due date =====
    if (dueDate && isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
            success: false,
            message: "Invalid due date"
        });
    }
    // ===== assignee =====
    if (assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignee"
        });
      }
        const member = await checkProjectMembership(projectId, assigneeId);
        if (!member) {
            return res.status(400).json({
            success: false,
            message: "Assignee must be a project member"
            });
        }
    }

    // ===== WIP =====
    const allowed = await checkWipLimit(columnId);

    if (allowed === null) {
      return res.status(404).json({
        success: false,
        message: "Column not found"
      });
    }

    if (!allowed) {
      return res.status(400).json({
        success: false,
        message: "WIP limit reached"
      });
    }

    // ===== position =====
    const position = await getLastPosition(columnId);

    // ===== create =====
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        priority,
        dueDate,
        columnId,
        projectId,
        assigneeId,
        reporterId: userId,
        parentId,
        type,
        position
      }
    });
    // notify assignee if one was set and they are not the creator
    if (assigneeId && assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: "TASK_ASSIGNED",
          message: `You have been assigned to task: "${task.title}"`
        }
      });
    }

    return res.status(201).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error(error);   
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// move task (also handles moving between columns and reordering within same column, same endpoint can be used for both drag and drop and changing column via edit form, for drag and drop we will get beforeTaskId and afterTaskId, for edit form we will just get columnId, in that case we will append to end of that column)

const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId, beforeTaskId, afterTaskId } = req.body;

    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: { select: { projectId: true } }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (task.type === "STORY") {
      return res.status(400).json({
        success: false,
        message: "Story cannot be moved"
      });
    }

    const projectId = task.projectId;

    const member = await checkProjectWriteAccess(projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to move task"
      });
    }

    const targetColumnId = columnId || task.columnId;
    if (!targetColumnId) {
      return res.status(400).json({
        success: false,
        message: "Column is required"
      });
    }
    const targetColumn = await prisma.column.findUnique({
    where: { id: targetColumnId },
    include: {
        board: {
        select: { projectId: true }
        }
    }
    });

    if (!targetColumn || targetColumn.board.projectId !== task.projectId) {
    return res.status(400).json({
        success: false,
        message: "Invalid target column"
    });
    }


    // WIP check if changing column
    if (targetColumnId !== task.columnId) {
        const allowed = await checkWipLimit(targetColumnId);// we know that a column exist as we have already checked above 
        if (!allowed) {
            return res.status(400).json({
                success: false,
                message: "WIP limit reached"
            });
        }
    }

    const position = await calculatePosition({
      columnId: targetColumnId,
      beforeTaskId,
      afterTaskId
    });

    if (position === null) {
    return res.status(400).json({
        success: false,
        message: "Invalid task positioning"
    });
    }
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        position
      }
    });
    // log column change as a status change
    if (targetColumnId !== task.columnId) {
      await logAudit({
        taskId,
        field: "columnId",
        oldValue: task.columnId ?? null,
        newValue: targetColumnId,
        userId
      });
    }
    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error(error);   
    return res.status(500).json({
      success: false,
      message:  "Internal server error"
    });
  }
};


//get task by id(also returns assignee and reporter info, and comments)

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        reporter: true,
        comments: true
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }
    const member = await checkProjectMembership(task.projectId, userId);// here viewer can also view the task, so we are just checking membership, not write access
    if (!member) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }
    return res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:  "Internal server error"
    });
  }
};
// this will be used to get all stories under a project (we will need this when we are creating task/bug and we want to show the list of stories to select parent from)
const getStoriesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // validation
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "ProjectId is required"
      });
    }

    // auth
    const member = await checkProjectMembership(projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // fetch stories
    const stories = await prisma.task.findMany({
      where: {
        projectId,
        type: "STORY"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: stories
    });

  } catch (error) {
   console.error(error);   

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// update task (only title, description, priority, dueDate, assignee can be updated, for changing column or reordering we will use move endpoint)

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;
    if (priority && !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Invalid priority"
        });
    }
    if (dueDate && isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
            success: false,
            message: "Invalid due date"
        });
    }
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
    if (assigneeId) {
        const user = await prisma.user.findUnique({
            where: { id: assigneeId }
        });

        if (!user) {
            return res.status(400).json({
            success: false,
            message: "Invalid assignee"
            });
        }
        const member = await checkProjectMembership(task.projectId, assigneeId);
        if (!member) {
            return res.status(400).json({
            success: false,
            message: "Assignee must be a project member"
            });
        } 
    }
    const member = await checkProjectWriteAccess(task.projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update task"
      });
    }
    if (title !== undefined && !title.trim()) {
    return res.status(400).json({
        success: false,
        message: "Title cannot be empty"
    });
    }
    if (task.type === "STORY") {
        return res.status(400).json({
            success: false,
            message: "Use story update API"
        });
    }
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim() ?? task.title,
        description,
        priority,
        dueDate,
        assigneeId
      }
    });

    // log only meaningful field changes(priority, dueDate, assignee) to audit log, title and description changes are not logged for simplicity, also we are not logging column changes here as that will be handled in move endpoint, we are also not logging story changes as they have a separate update endpoint
    if (priority && priority !== task.priority) {
      await logAudit({
        taskId,
        field: "priority",
        oldValue: task.priority,
        newValue: priority,
        userId
      });
    }

    if (assigneeId !== undefined && assigneeId !== task.assigneeId) {
      await logAudit({
        taskId,
        field: "assigneeId",
        oldValue: task.assigneeId ?? null,
        newValue: assigneeId ?? null,
        userId
      });
    }

    if (dueDate !== undefined && dueDate !== task.dueDate?.toISOString()) {
      await logAudit({
        taskId,
        field: "dueDate",
        oldValue: task.dueDate ? task.dueDate.toISOString() : null,
        newValue: dueDate ?? null,
        userId
      });
    }
    // if assignee changed, notify the new assignee and the old one
    const assigneeChanged = assigneeId !== undefined && assigneeId !== task.assigneeId;
    if (assigneeChanged) {
      const notifications = [];

      // notify newly assigned user (skip if they assigned themselves)
      if (assigneeId && assigneeId !== userId) {
        notifications.push({
          userId: assigneeId,
          type: "TASK_ASSIGNED",
          message: `You have been assigned to task: "${task.title}"`
        });
      }

      // notify old assignee they were unassigned (skip if they made the change)
      if (task.assigneeId && task.assigneeId !== userId) {
        notifications.push({
          userId: task.assigneeId,
          type: "TASK_ASSIGNED",
          message: `You have been unassigned from task: "${task.title}"`
        });
      }

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    }

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error(error);   
    return res.status(500).json({
      success: false,
      message:  "Internal server error"
    });
  }
};
// update story
const updateStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    const story = await prisma.task.findUnique({
      where: { id: storyId }
    });

    if (!story || story.type !== "STORY") {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    const member = await checkProjectWriteAccess(story.projectId, userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update story"
      });
    }

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty"
      });
    }

    if (priority && !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority"
      });
    }
    if (dueDate && isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
            success: false,
            message: "Invalid due date"
        });
    }

    const updated = await prisma.task.update({
      where: { id: storyId },
      data: {
        title: title?.trim() ?? story.title,
        description,
        priority,
        dueDate,
        columnId: null,   // enforce invariant
        position: null,
        parentId: null
      }
    });
    if (priority && priority !== story.priority) {
        await logAudit({
          taskId: storyId,
          field: "priority",
          oldValue: story.priority,
          newValue: priority,
          userId
        });
    }

    if (dueDate !== undefined && dueDate !== story.dueDate?.toISOString()) {
        await logAudit({
          taskId: storyId,
          field: "dueDate",
          oldValue: story.dueDate ? story.dueDate.toISOString() : null,
          newValue: dueDate ?? null,
          userId
        });
    }

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
//delete task (only admin can delete task)
const deleteTask = async (req, res) => {
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

    const admin = await checkProjectAdmin(task.projectId, userId);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete"
      });
    }

    await prisma.$transaction([
      prisma.task.deleteMany({
        where: { parentId: taskId }   // delete children
      }),
      prisma.task.delete({
        where: { id: taskId }         // delete parent
      })
    ]);

    return res.status(200).json({
      success: true,
      message: "Deleted successfully"
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
  createStory,
  createWorkItem,
  getStoriesByProject,
  updateStory,
  moveTask,
  getTaskById,
  updateTask,
  deleteTask
};