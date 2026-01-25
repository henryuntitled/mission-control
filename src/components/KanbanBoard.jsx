import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';

const COLUMNS = ['Recurring', 'Backlog', 'In Progress', 'In Review', 'Done'];

export function KanbanBoard() {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getStats,
    getProjects,
    moveTask,
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('Backlog');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const projects = useMemo(() => getProjects(), [getProjects]);
  const stats = useMemo(() => getStats(), [getStats]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (assigneeFilter !== 'All' && !task.assignees.includes(assigneeFilter)) {
        return false;
      }
      if (projectFilter !== 'All' && task.project !== projectFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, assigneeFilter, projectFilter]);

  const getColumnTasks = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleTaskClick = (task) => {
    // Don't open modal if we just finished dragging
    if (activeTask) return;
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setEditingTask({ status });
    setModalOpen(true);
  };

  const handleNewTask = () => {
    setDefaultStatus('Backlog');
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleSave = (formData) => {
    if (editingTask?.id) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;

    // Check if dropped on a column
    if (COLUMNS.includes(over.id)) {
      if (task.status !== over.id) {
        moveTask(taskId, over.id);
      }
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && task.status !== overTask.status) {
      moveTask(taskId, overTask.status);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;

    // If over a column, update preview
    if (COLUMNS.includes(over.id)) {
      return;
    }

    // If over another task, check its column
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      return;
    }
  };

  // Custom collision detection that prefers columns
  const collisionDetection = (args) => {
    // First check for intersections with columns
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prefer column collisions
      const columnCollision = pointerCollisions.find(c => COLUMNS.includes(c.id));
      if (columnCollision) {
        return [columnCollision];
      }
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="min-h-screen bg-navy-900 p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-accent">⬡</span>
                Mission Control
              </h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage your team's tasks</p>
            </div>
            <StatsBar stats={stats} />
          </div>
          <FilterBar
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
            projects={projects}
            onNewTask={handleNewTask}
          />
        </header>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <Column
              key={column}
              title={column}
              tasks={getColumnTasks(column)}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onClick={() => {}} isDragOverlay />
          ) : null}
        </DragOverlay>

        {modalOpen && (
          <TaskModal
            task={editingTask}
            onSave={handleSave}
            onDelete={editingTask?.id ? handleDelete : null}
            onClose={handleCloseModal}
            projects={projects}
          />
        )}
      </div>
    </DndContext>
  );
}
