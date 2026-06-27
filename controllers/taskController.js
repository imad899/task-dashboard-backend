import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

// Resolve the data file path (ES modules have no __dirname by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "tasks.json");

const VALID_STATUSES = ["todo", "in-progress", "done"];

// --- Helpers ---
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    if (err.code === "ENOENT") {
      // File doesn't exist yet — start empty
      await writeTasks([]);
      return [];
    }
    throw err;
  }
}

async function writeTasks(tasks) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

// --- Controllers ---

// GET /api/tasks
export async function getTasks(req, res, next) {
  try {
    const tasks = await readTasks();
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

    const tasks = await readTasks();
    const newTask = {
      id: randomUUID(),
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
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

    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = {
      ...tasks[index],
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status !== undefined && { status }),
    };

    tasks[index] = updated;
    await writeTasks(tasks);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const [removed] = tasks.splice(index, 1);
    await writeTasks(tasks);
    res.json({ message: "Task deleted", task: removed });
  } catch (err) {
    next(err);
  }
}