import "dotenv/config";
import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB(); // connect to MongoDB before starting the server

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Task Management Dashboard API is running",
    endpoints: {
      getTasks: "GET /api/tasks",
      createTask: "POST /api/tasks",
      updateTask: "PUT /api/tasks/:id",
      deleteTask: "DELETE /api/tasks/:id",
    },
  });
});

app.use("/api/tasks", tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});