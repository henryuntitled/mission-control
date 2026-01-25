import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
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
  const [mobileColumn, setMobileColumn] = useState('Backlog');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
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

    if (COLUMNS.includes(over.id)) {
      if (task.status !== over.id) {
        moveTask(taskId, over.id);
      }
      return;
    }

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

    if (COLUMNS.includes(over.id)) {
      return;
    }

    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      return;
    }
  };

  const collisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
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
      <div className="min-h-screen bg-navy-900 p-3 sm:p-6">
        <header className="mb-4 sm:mb-6">
          {/* Mobile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-accent">⬡</span>
                Mission Control
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and manage your tasks</p>
            </div>
            {/* Hide stats on mobile, show on sm+ */}
            <div className="hidden sm:block">
              <StatsBar stats={stats} />
            </div>
          </div>

          {/* Mobile Stats - compact version */}
          <div className="flex sm:hidden gap-2 mb-4 text-xs">
            <div className="flex-1 bg-navy-800 rounded-lg px-3 py-2 text-center">
              <p className="text-gray-500">In Progress</p>
              <p className="text-white font-semibold">{stats.inProgress}</p>
            </div>
            <div className="flex-1 bg-navy-800 rounded-lg px-3 py-2 text-center">
              <p className="text-gray-500">Total</p>
              <p className="text-white font-semibold">{stats.total}</p>
            </div>
            <div className="flex-1 bg-navy-800 rounded-lg px-3 py-2 text-center">
              <p className="text-gray-500">Done</p>
              <p className="text-white font-semibold">{stats.completion}%</p>
            </div>
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

        {/* Mobile Column Tabs */}
        <div className="flex sm:hidden gap-1 mb-4 overflow-x-auto pb-2">
          {COLUMNS.map((column) => {
            const count = getColumnTasks(column).length;
            return (
              <button
                key={column}
                onClick={() => setMobileColumn(column)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  mobileColumn === column
                    ? 'bg-accent text-white'
                    : 'bg-navy-800 text-gray-400'
                }`}
              >
                {column} ({count})
              </button>
            );
          })}
        </div>

        {/* Desktop: All columns */}
        <div className="hidden sm:flex gap-4 overflow-x-auto pb-4">
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

        {/* Mobile: Single column */}
        <div className="sm:hidden">
          <Column
            title={mobileColumn}
            tasks={getColumnTasks(mobileColumn)}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            isMobile
          />
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
