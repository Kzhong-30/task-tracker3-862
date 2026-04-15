# Task Tracker 📝  
A full-stack task management application built using the **MERN stack**, fully containerized with **Docker**, orchestrated with **Docker Compose**, and automated using **GitHub Actions CI**.

This project was built to strengthen my Software Engineering + DevOps fundamentals while learning modern tooling and best practices.

---

## 🚀 Features

### 🖥 Frontend (React + Vite)
- Beautiful modern UI (dark & light mode)
- Task difficulty selector (Easy / Medium / Hard)
- Search and filtering (All / Active / Completed)
- Task statistics + progress bar
- Fully responsive design

### 🛠 Backend (Node.js + Express)
- REST API for managing tasks  
- CRUD operations  
- MongoDB database integration  
- Mongoose-based schema validation  

### 🐳 DevOps Features
- Fully containerized services:
  - **client** (React)
  - **api** (Node/Express)
  - **mongo** (MongoDB 7.x)
- One-command startup:

- Persistent MongoDB volume  
- GitHub Actions CI pipeline:
- Installs dependencies
- Builds frontend
- Validates Docker Compose config
- Builds Docker images for both services

---

## 🧱 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Client     │───▶│     API      │───▶│   MongoDB   │  │
│  │ React + Vite │    │Node + Express│    │   Database  │  │
│  │  Port: 5173  │    │  Port: 5000  │    │ Port: 27017 │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
task-tracker/
├── api/                    # Backend (Node.js + Express)
│   ├── models/
│   │   └── Task.js        # Mongoose schema
│   ├── server.js          # Express API server
│   ├── Dockerfile
│   └── package.json
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   └── App.css        # Styles
│   ├── Dockerfile
│   └── package.json
├── assets/
│   └── screenshots/       # UI screenshots
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI pipeline
├── docker-compose.yml     # Multi-container orchestration
└── README.md
```
└────────────┘


All services communicate inside a Docker network using Docker Compose.

---

## 🐳 Getting Started (Docker)

### Clone the repo:
```bash
git clone https://github.com/thusarav/task-tracker.git
cd task-tracker

## 🐳 Run everything:
docker compose up --build

## 🐳 Access the app:
Frontend: http://localhost:5173
API: http://localhost:5000/api/tasks

📂 Project Structure
task-tracker/
│
├── api/              # Backend (Node + Express)
├── client/           # Frontend (React + Vite)
├── .github/workflows # GitHub Actions CI pipeline
├── docker-compose.yml
└── README.md

🔄 CI/CD Pipeline
The GitHub Actions workflow automatically performs:
npm ci for clean installs
Frontend build
Docker Compose validation
Docker image builds for client & api
You can view builds in the Actions tab of the repository.

## 📸 Screenshots

### Dark Mode
![Dark Mode](https://raw.githubusercontent.com/thusarav/task-tracker/main/assets/screenshots/ui-dark.png)

### Light Mode
![Light Mode](https://raw.githubusercontent.com/thusarav/task-tracker/main/assets/screenshots/ui-light.png)

## 🛠 Tech Stack

- React
- Vite
- Node.js
- Express
- MongoDB
- Docker
- Docker Compose
- GitHub Actions CI

## 📈 Future Improvements

- Production build using Nginx
- Multi-stage Docker builds
- Task editing functionality
- User authentication (JWT)
- Deploy to cloud (Railway / Render / AWS)
