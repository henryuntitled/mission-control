import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'tasks.db');
const dataDir = join(__dirname, '..', 'data');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(dataDir, { recursive: true });
} catch (e) {
  // Directory already exists
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'Backlog',
    priority TEXT DEFAULT 'Medium',
    assignees TEXT DEFAULT '[]',
    project TEXT DEFAULT '',
    output TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`);

// Check if we need to seed initial data
const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get();

if (count.count === 0) {
  // Try to load initial data from tasks.json
  const tasksJsonPath = join(__dirname, '..', 'tasks.json');
  if (existsSync(tasksJsonPath)) {
    try {
      const initialData = JSON.parse(readFileSync(tasksJsonPath, 'utf-8'));
      const insert = db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, assignees, project, output, createdAt)
        VALUES (@id, @title, @description, @status, @priority, @assignees, @project, @output, @createdAt)
      `);

      const insertMany = db.transaction((tasks) => {
        for (const task of tasks) {
          insert.run({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignees: JSON.stringify(task.assignees || []),
            project: task.project || '',
            output: task.output || '',
            createdAt: task.createdAt || new Date().toISOString(),
          });
        }
      });

      insertMany(initialData.tasks);
      console.log(`Seeded ${initialData.tasks.length} tasks from tasks.json`);
    } catch (e) {
      console.error('Failed to seed initial data:', e);
    }
  }
}

export default db;
