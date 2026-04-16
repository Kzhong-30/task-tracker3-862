const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const express = require("express");
const cors = require("express");

const Task = require("../models/Task");

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);

  app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/tasks", async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const { title, priority, createdAt } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = await Task.create({
      title,
      priority: priority || "medium",
      createdAt: createdAt || new Date(),
    });
    res.status(201).json(task);
  });

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

  app.patch("/api/tasks/:id/toggle", async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(204).end();
  });

  app.get("/", (req, res) => {
    res.send("Task Tracker API is running");
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Task.deleteMany({});
});

describe("Task API", () => {
  describe("GET /api/tasks", () => {
    it("should return empty array when no tasks exist", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all tasks sorted by createdAt", async () => {
      await Task.create([
        { title: "Task 1", createdAt: new Date("2024-01-01") },
        { title: "Task 2", createdAt: new Date("2024-01-02") },
      ]);

      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe("Task 2");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task with default values", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "New Task" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Task");
      expect(res.body.priority).toBe("medium");
      expect(res.body.completed).toBe(false);
    });

    it("should create a task with custom priority", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "High Priority Task", priority: "high" });

      expect(res.status).toBe(201);
      expect(res.body.priority).toBe("high");
    });

    it("should return 400 if title is missing", async () => {
      const res = await request(app).post("/api/tasks").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Title is required");
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("should update task title and priority", async () => {
      const task = await Task.create({ title: "Original Task" });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .send({ title: "Updated Task", priority: "high" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Task");
      expect(res.body.priority).toBe("high");
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/tasks/${fakeId}`)
        .send({ title: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  describe("PATCH /api/tasks/:id/toggle", () => {
    it("should toggle task completion status", async () => {
      const task = await Task.create({ title: "Task to toggle" });
      expect(task.completed).toBe(false);

      const res = await request(app).patch(`/api/tasks/${task._id}/toggle`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);

      const res2 = await request(app).patch(`/api/tasks/${task._id}/toggle`);
      expect(res2.body.completed).toBe(false);
    });

    it("should return 404 for non-existent task toggle", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/tasks/${fakeId}/toggle`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await Task.create({ title: "Task to delete" });

      const res = await request(app).delete(`/api/tasks/${task._id}`);
      expect(res.status).toBe(204);

      const tasks = await Task.find();
      expect(tasks).toHaveLength(0);
    });
  });

  describe("GET /", () => {
    it("should return API status message", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Task Tracker API is running");
    });
  });
});
