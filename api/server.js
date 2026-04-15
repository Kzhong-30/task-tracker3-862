const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/tasktracker";

app.use(cors());
app.use(express.json());

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// Create task
app.post("/api/tasks", async (req, res) => {
  const { title, priority, createdAt } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const task = await Task.create({ 
    title, 
    priority: priority || "medium",
    createdAt: createdAt || new Date()
  });
  res.status(201).json(task);
});

// Update task
app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, priority } = req.body;
  
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  
  if (title) task.title = title;
  if (priority) task.priority = priority;
  
  await task.save();
  res.json(task);
});

// Toggle complete
app.patch("/api/tasks/:id/toggle", async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.status(204).end();
});

app.get("/", (req, res) => {
  res.send("Task Tracker API is running");
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 API server listening on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
