import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ============================================================================
// Helpers
// ============================================================================

const parseTask = (row) => ({
  ...row,
  assignees: JSON.parse(row.assignees || '[]'),
});

const serializeAssignees = (assignees) => JSON.stringify(assignees || []);

const VALID_STATUSES = ['Recurring', 'Backlog', 'In Progress', 'In Review', 'Done'];
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_RECURRENCES = ['daily', 'weekly', 'biweekly', 'monthly', null];

// Input validation
function validateTask(body, isPartial = false) {
  const errors = [];

  if (!isPartial && (!body.title || typeof body.title !== 'string' || !body.title.trim())) {
    errors.push('Title is required');
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') errors.push('Title must be a string');
    else if (body.title.length > 500) errors.push('Title must be 500 characters or less');
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') errors.push('Description must be a string');
    else if (body.description.length > 5000) errors.push('Description must be 5000 characters or less');
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (body.assignees !== undefined) {
    if (!Array.isArray(body.assignees)) errors.push('Assignees must be an array');
    else if (body.assignees.some(a => typeof a !== 'string')) errors.push('Each assignee must be a string');
  }

  if (body.recurrence !== undefined && body.recurrence !== null && !VALID_RECURRENCES.includes(body.recurrence)) {
    errors.push(`Invalid recurrence. Must be one of: ${VALID_RECURRENCES.filter(Boolean).join(', ')}`);
  }

  if (body.project !== undefined && typeof body.project !== 'string') {
    errors.push('Project must be a string');
  }

  if (body.output !== undefined && typeof body.output !== 'string') {
    errors.push('Output must be a string');
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    if (typeof body.dueDate !== 'string' || (body.dueDate && !/^\d{4}-\d{2}-\d{2}/.test(body.dueDate))) {
      errors.push('Due date must be in YYYY-MM-DD format');
    }
  }

  return errors;
}

// Helper to calculate next due date based on recurrence
const getNextDueDate = (currentDueDate, recurrence) => {
  if (!currentDueDate || !recurrence) return null;
  
  const [year, month, day] = currentDueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  
  return date.toISOString().split('T')[0];
};

// ============================================================================
// Routes
// ============================================================================

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    res.json(tasks.map(parseTask));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(parseTask(task));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create task
app.post('/api/tasks', (req, res) => {
  try {
    const errors = validateTask(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { title, description, status, priority, assignees, project, output, dueDate, recurrence } = req.body;
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, assignees, project, output, dueDate, recurrence, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      (description || '').trim(),
      status || 'Backlog',
      priority || 'Medium',
      serializeAssignees(assignees),
      (project || '').trim(),
      (output || '').trim(),
      dueDate || null,
      recurrence || null,
      createdAt,
      createdAt
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(parseTask(task));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const errors = validateTask(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { title, description, status, priority, assignees, project, output, dueDate, recurrence } = req.body;
    const updatedAt = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, assignees = ?, project = ?, output = ?, dueDate = ?, recurrence = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      (title ?? existing.title).trim?.() ?? existing.title,
      (description ?? existing.description).trim?.() ?? existing.description,
      status ?? existing.status,
      priority ?? existing.priority,
      assignees !== undefined ? serializeAssignees(assignees) : existing.assignees,
      (project ?? existing.project).trim?.() ?? existing.project,
      (output ?? existing.output).trim?.() ?? existing.output,
      dueDate !== undefined ? dueDate : existing.dueDate,
      recurrence !== undefined ? recurrence : existing.recurrence,
      updatedAt,
      req.params.id
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(parseTask(task));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH update task (partial update - useful for moving tasks)
app.patch('/api/tasks/:id', (req, res) => {
  try {
    const errors = validateTask(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const updates = req.body;
    const updatedAt = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if this is a recurring task being moved to Done
    let newTask = null;
    if (updates.status === 'Done' && existing.status !== 'Done' && existing.recurrence) {
      // Create a new task for the next occurrence
      const nextDueDate = getNextDueDate(existing.dueDate, existing.recurrence);
      const newId = Date.now().toString();
      const createdAt = new Date().toISOString();

      db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, assignees, project, output, dueDate, recurrence, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        existing.title,
        existing.description,
        'Backlog', // New task starts in Backlog
        existing.priority,
        existing.assignees,
        existing.project,
        '', // Clear output for new task
        nextDueDate,
        existing.recurrence,
        createdAt,
        createdAt
      );

      newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(newId);
    }

    // Build dynamic update query
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title.trim?.() ?? updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description.trim?.() ?? updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.assignees !== undefined) {
      fields.push('assignees = ?');
      values.push(serializeAssignees(updates.assignees));
    }
    if (updates.project !== undefined) {
      fields.push('project = ?');
      values.push(updates.project.trim?.() ?? updates.project);
    }
    if (updates.output !== undefined) {
      fields.push('output = ?');
      values.push(updates.output.trim?.() ?? updates.output);
    }
    if (updates.dueDate !== undefined) {
      fields.push('dueDate = ?');
      values.push(updates.dueDate);
    }
    if (updates.recurrence !== undefined) {
      fields.push('recurrence = ?');
      values.push(updates.recurrence);
    }

    // Clear recurrence on completed task so it doesn't trigger again
    if (updates.status === 'Done' && existing.recurrence) {
      fields.push('recurrence = ?');
      values.push(null);
    }

    if (fields.length > 0) {
      fields.push('updatedAt = ?');
      values.push(updatedAt);
      values.push(req.params.id);

      db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    // Return both the updated task and the new recurring task if created
    const response = parseTask(task);
    if (newTask) {
      response.newRecurringTask = parseTask(newTask);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    taskCount: db.prepare('SELECT COUNT(*) as count FROM tasks').get().count,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mission Control API running on http://localhost:${PORT}`);
});
