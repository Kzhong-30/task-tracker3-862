const request = require('supertest');
const express = require('express');
const Task = require('../models/Task');

jest.mock('../models/Task');

const app = express();
app.use(express.json());
app.use(require('cors')());

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const { title, priority, createdAt } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const task = await Task.create({
    title,
    priority: priority || 'medium',
    createdAt: createdAt || new Date(),
  });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, priority } = req.body;

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (title) task.title = title;
  if (priority) task.priority = priority;

  await task.save();
  res.json(task);
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.status(204).end();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Task API', () => {
  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
      expect(Task.find).toHaveBeenCalled();
    });

    it('should return all tasks', async () => {
      const mockTasks = [
        { _id: '1', title: 'Test Task 1' },
        { _id: '2', title: 'Test Task 2' },
      ];
      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks),
      });

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(Task.find).toHaveBeenCalled();
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = { title: 'New Task', priority: 'high' };
      const mockCreatedTask = {
        _id: '1',
        title: 'New Task',
        priority: 'high',
        completed: false,
      };
      Task.create.mockResolvedValue(mockCreatedTask);

      const res = await request(app).post('/api/tasks').send(taskData);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('New Task');
      expect(res.body.priority).toBe('high');
      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          priority: 'high',
        }),
      );
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app).post('/api/tasks').send({ priority: 'high' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Title is required');
      expect(Task.create).not.toHaveBeenCalled();
    });

    it('should use default priority when not provided', async () => {
      const mockCreatedTask = {
        _id: '1',
        title: 'Default Priority Task',
        priority: 'medium',
      };
      Task.create.mockResolvedValue(mockCreatedTask);

      const res = await request(app).post('/api/tasks').send({ title: 'Default Priority Task' });
      expect(res.statusCode).toBe(201);
      expect(res.body.priority).toBe('medium');
      expect(Task.create).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const mockTask = {
        _id: '123',
        title: 'Old Title',
        priority: 'low',
        save: jest.fn().mockResolvedValue(true),
      };
      Task.findById.mockResolvedValue(mockTask);

      const res = await request(app).patch('/api/tasks/123').send({ title: 'New Title', priority: 'high' });

      expect(res.statusCode).toBe(200);
      expect(mockTask.title).toBe('New Title');
      expect(mockTask.priority).toBe('high');
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should return 404 for non-existent task', async () => {
      Task.findById.mockResolvedValue(null);

      const res = await request(app).patch('/api/tasks/999').send({ title: 'Updated' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    it('should toggle task completion status from false to true', async () => {
      const mockTask = {
        _id: '123',
        title: 'Toggle Test',
        completed: false,
        save: jest.fn().mockResolvedValue(true),
      };
      Task.findById.mockResolvedValue(mockTask);

      const res = await request(app).patch('/api/tasks/123/toggle');
      expect(res.statusCode).toBe(200);
      expect(mockTask.completed).toBe(true);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should toggle task completion status from true to false', async () => {
      const mockTask = {
        _id: '123',
        title: 'Toggle Test',
        completed: true,
        save: jest.fn().mockResolvedValue(true),
      };
      Task.findById.mockResolvedValue(mockTask);

      const res = await request(app).patch('/api/tasks/123/toggle');
      expect(res.statusCode).toBe(200);
      expect(mockTask.completed).toBe(false);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should return 404 for non-existent task', async () => {
      Task.findById.mockResolvedValue(null);
      const res = await request(app).patch('/api/tasks/999/toggle');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      Task.findByIdAndDelete.mockResolvedValue({ _id: '123', title: 'Delete Me' });

      const res = await request(app).delete('/api/tasks/123');
      expect(res.statusCode).toBe(204);
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith('123');
    });
  });
});
