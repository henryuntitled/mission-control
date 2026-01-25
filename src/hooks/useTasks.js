import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const moveTask = useCallback(async (id, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: newStatus } : task))
    );

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        // Revert on failure
        await fetchTasks();
        throw new Error('Failed to move task');
      }
      
      const data = await response.json();
      
      // If a new recurring task was created, add it to state
      if (data.newRecurringTask) {
        setTasks((prev) => {
          // Update the completed task (remove recurrence) and add new task
          return prev.map((task) => 
            task.id === id ? { ...task, status: newStatus, recurrence: null } : task
          ).concat([data.newRecurringTask]);
        });
      }
    } catch (err) {
      console.error('Error moving task:', err);
      setError(err.message);
    }
  }, [fetchTasks]);

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((task) => task.status === status),
    [tasks]
  );

  const getStats = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = tasks.filter(
      (t) => new Date(t.createdAt) >= weekAgo
    ).length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    const completion = total > 0 ? Math.round((done / total) * 100) : 0;

    return { thisWeek, inProgress, total, completion };
  }, [tasks]);

  const getProjects = useCallback(() => {
    const projects = [...new Set(tasks.map((t) => t.project).filter(Boolean))];
    return projects.sort();
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getStats,
    getProjects,
    refetch: fetchTasks,
  };
}
