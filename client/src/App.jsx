import { useEffect, useState, useRef } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showConfetti, setShowConfetti] = useState(false);
  const [deletedTask, setDeletedTask] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const inputRef = useRef(null);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      showToastMessage("Failed to fetch tasks");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, createdAt: new Date().toISOString() }),
      });
      setTitle("");
      setPriority("medium");
      showToastMessage("Task added successfully! ✅");
      fetchTasks();
    } catch (error) {
      showToastMessage("Failed to add task");
    }
  }

  async function toggleTask(id) {
    try {
      await fetch(`${API_URL}/api/tasks/${id}/toggle`, {
        method: "PATCH",
      });
      await fetchTasks();
      
      const updatedTask = tasks.find(t => t._id === id);
      if (updatedTask && !updatedTask.completed) {
        const allCompleted = tasks.every(t => t._id === id ? true : t.completed);
        if (allCompleted && tasks.length > 0) {
          setShowConfetti(true);
          showToastMessage("🎉 All tasks completed! Great job!");
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    } catch (error) {
      showToastMessage("Failed to update task");
    }
  }

  async function deleteTask(id) {
    const taskToDelete = tasks.find(t => t._id === id);
    setDeletedTask(taskToDelete);
    
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      showToastMessage("Task deleted");
      fetchTasks();
      
      setTimeout(() => setDeletedTask(null), 5000);
    } catch (error) {
      showToastMessage("Failed to delete task");
      setDeletedTask(null);
    }
  }

  async function undoDelete() {
    if (!deletedTask) return;
    
    try {
      await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deletedTask),
      });
      setDeletedTask(null);
      showToastMessage("Task restored! ↩️");
      fetchTasks();
    } catch (error) {
      showToastMessage("Failed to restore task");
    }
  }

  function startEdit(task) {
    setEditingId(task._id);
    setEditText(task.title);
  }

  async function saveEdit(id) {
    if (!editText.trim()) return;
    
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editText }),
      });
      setEditingId(null);
      showToastMessage("Task updated! ✏️");
      fetchTasks();
    } catch (error) {
      showToastMessage("Failed to update task");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function clearCompleted() {
    const completedTasks = tasks.filter((t) => t.completed);
    await Promise.all(
      completedTasks.map((task) =>
        fetch(`${API_URL}/api/tasks/${task._id}`, { method: "DELETE" })
      )
    );
    fetchTasks();
  }

  useEffect(() => {
    fetchTasks();
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingId) {
        cancelEdit();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingId]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "active" ? !task.completed :
      task.completed;
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  function getTimeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="app-container">
      {showConfetti && <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="confetti" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f'][Math.floor(Math.random() * 5)]
          }} />
        ))}
      </div>}
      
      {showToast && <div className="toast">{toastMessage}</div>}
      
      {deletedTask && (
        <div className="undo-banner">
          <span>Task deleted</span>
          <button onClick={undoDelete} className="undo-button">Undo</button>
        </div>
      )}
      
      <div className="task-card">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <header className="header">
          <h1 className="title">Task Tracker 📋</h1>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{totalTasks}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number active">{activeTasks}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number completed">{completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(progressPercentage)}% Complete</span>
          </div>
        </header>

        <form onSubmit={addTask} className="add-task-form">
          <div className="input-group">
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done? (Press Enter to add)"
              className="task-input"
            />
            <div className="priority-group">
              <label className="priority-label">Difficulty</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="priority-select"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="add-button">
            ➕ Add Task
          </button>
        </form>

        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tasks..."
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All ({totalTasks})
          </button>
          <button
            className={filter === "active" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("active")}
          >
            Active ({activeTasks})
          </button>
          <button
            className={filter === "completed" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("completed")}
          >
            Completed ({completedTasks})
          </button>
        </div>

        {loading ? (
          <div className="loading-skeleton">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-checkbox"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchQuery ? "🔍" : filter === "all" ? "📝" : filter === "active" ? "🎉" : "✅"}
            </div>
            <p className="empty-message">
              {searchQuery ? `No tasks matching "${searchQuery}"` :
               filter === "all" ? "No tasks yet. Add one above!" :
               filter === "active" ? "No active tasks. Great job! 🎉" :
               "No completed tasks yet."}
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task, index) => (
              <li 
                key={task._id} 
                className={`task-item ${task.completed ? 'completed-item' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="task-left">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task._id)}
                    className="task-checkbox"
                  />
                  {editingId === task._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => saveEdit(task._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task._id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="edit-input"
                      autoFocus
                    />
                  ) : (
                    <div className="task-text-container">
                      <div className="task-title-row">
                        <span 
                          className={task.completed ? "task-text completed" : "task-text"}
                          onClick={() => toggleTask(task._id)}
                        >
                          {task.title}
                        </span>
                        {task.priority && (
                          <span className={`priority-badge priority-${task.priority}`}>
                            {task.priority === 'high' && '🔴'}
                            {task.priority === 'medium' && '🟡'}
                            {task.priority === 'low' && '🟢'}
                          </span>
                        )}
                      </div>
                      {task.createdAt && (
                        <span className="task-time">{getTimeAgo(task.createdAt)}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="task-actions">
                  {!task.completed && editingId !== task._id && (
                    <button 
                      onClick={() => startEdit(task)} 
                      className="edit-button"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task._id)} 
                    className="delete-button"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {completedTasks > 0 && (
          <button onClick={clearCompleted} className="clear-completed">
            Clear Completed ({completedTasks})
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
