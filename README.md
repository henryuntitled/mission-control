# Mission Control

A Kanban-style task management board built for Untitled Creative. Track tasks across columns, assign team members, set due dates, and manage recurring work.

![Mission Control](https://img.shields.io/badge/status-deployed-brightgreen)

## Features

- **Kanban Board** — Drag-and-drop tasks across columns (Recurring, Backlog, In Progress, In Review, Done)
- **Task Management** — Create, edit, delete tasks with title, description, priority, assignees, projects, and due dates
- **Recurring Tasks** — Set tasks to repeat daily, weekly, biweekly, or monthly. Completing a recurring task auto-creates the next occurrence
- **Filters** — Filter by assignee (Zach/Henry) and project
- **Search** — Full-text search across task titles and descriptions
- **Due Date Tracking** — Visual indicators for overdue, due today, due tomorrow
- **Mobile Responsive** — Tab-based column navigation on mobile
- **Stats Dashboard** — Track task counts, completion rate, and weekly progress

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4 + dnd-kit
- **Backend:** Express 5 + better-sqlite3
- **Deployment:** Vercel (frontend) + Railway (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev:all

# Or start separately:
npm run server   # Backend on http://localhost:3001
npm run dev      # Frontend on http://localhost:5173
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend
VITE_API_URL=http://localhost:3001/api

# Backend (auto-configured on Railway)
PORT=3001
RAILWAY_ENVIRONMENT=  # Set by Railway automatically
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Full update task |
| PATCH | `/api/tasks/:id` | Partial update (move, status change) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/health` | Health check |

## Project Structure

```
mission-control/
├── src/
│   ├── components/
│   │   ├── KanbanBoard.jsx   # Main board layout
│   │   ├── Column.jsx        # Kanban column
│   │   ├── TaskCard.jsx      # Individual task card
│   │   ├── TaskModal.jsx     # Create/edit modal
│   │   ├── FilterBar.jsx     # Filter controls
│   │   └── StatsBar.jsx      # Stats display
│   ├── hooks/
│   │   └── useTasks.js       # Task state management
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── index.js              # Express API
│   ├── db.js                 # SQLite setup
│   └── package.json
├── data/                     # SQLite database (gitignored)
└── package.json
```

## Deployment

### Frontend (Vercel)
- Connects to GitHub repo
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` environment variable to the Railway backend URL

### Backend (Railway)
- Deploys from `server/` directory
- Uses Railway persistent volume at `/app/data` for SQLite
- Auto-seeds from `tasks.json` on first run
