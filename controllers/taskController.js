import Task from "../models/Task.js";

const VALID_STATUSES = ["todo", "in-progress", "done"];

// GET /api/tasks
export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
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
    const { title, description, status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ error: "title cannot be empty" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,           // return the updated doc
      runValidators: true, // enforce schema rules on update
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    // invalid ObjectId format throws a CastError -> treat as not found
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