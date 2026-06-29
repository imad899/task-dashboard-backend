import Task from "../models/Task.js";

const VALID_STATUSES = ["todo", "in-progress", "done"];
const VALID_PRIORITIES = ["high", "medium", "low"];

// GET /api/tasks?priority=high
export async function getTasks(req, res, next) {
  try {
    const { priority } = req.query;
    const filter = {};

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
        });
      }
      filter.priority = priority;
    }

    const tasks = await Task.find(filter).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

// PUT /api/tasks/:id
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ error: "title cannot be empty" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate || null;

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ error: "Task not found" });
    }
    next(err);
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted", task });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ error: "Task not found" });
    }
    next(err);
  }
}