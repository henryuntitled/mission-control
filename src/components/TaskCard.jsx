import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityColors = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const assigneeColors = {
  Zach: 'bg-blue-500',
  Henry: 'bg-emerald-500',
};

export function TaskCard({ task, onClick, isDragOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const timeAgo = useMemo(() => {
    const now = new Date();
    const created = new Date(task.createdAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  }, [task.createdAt]);

  const dueDateInfo = useMemo(() => {
    if (!task.dueDate) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Parse date as local time (not UTC) by appending time
    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    // Don't show due date indicators for Done tasks
    const isDone = task.status === 'Done';
    
    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)}d overdue`,
        className: isDone ? 'text-gray-500' : 'text-red-400 bg-red-500/20',
        isOverdue: !isDone,
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due today',
        className: isDone ? 'text-gray-500' : 'text-orange-400 bg-orange-500/20',
        isOverdue: false,
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due tomorrow',
        className: isDone ? 'text-gray-500' : 'text-yellow-400 bg-yellow-500/20',
        isOverdue: false,
      };
    } else if (diffDays <= 7) {
      return {
        text: `Due in ${diffDays}d`,
        className: 'text-gray-400 bg-navy-600',
        isOverdue: false,
      };
    } else {
      const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        text: formatted,
        className: 'text-gray-500 bg-navy-600',
        isOverdue: false,
      };
    }
  }, [task.dueDate, task.status]);

  const handleClick = (e) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-navy-700 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:bg-navy-600 transition-all duration-200 border border-navy-600 hover:border-accent/50 group select-none ${
        isDragging ? 'opacity-50 shadow-2xl ring-2 ring-accent' : ''
      } ${isDragOverlay ? 'shadow-2xl ring-2 ring-accent rotate-2' : ''} ${
        dueDateInfo?.isOverdue ? 'ring-1 ring-red-500/50 border-red-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {task.recurrence && (
            <span className="text-purple-400" title={`Repeats ${task.recurrence}`}>🔄</span>
          )}
          <h3 className="text-sm font-medium text-gray-100 group-hover:text-white leading-tight">
            {task.title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {task.assignees.map((assignee) => (
            <div
              key={assignee}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${assigneeColors[assignee] || 'bg-gray-500'}`}
              title={assignee}
            >
              {assignee[0]}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {task.project && (
            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">
              {task.project}
            </span>
          )}
          {dueDateInfo ? (
            <span className={`text-xs px-2 py-0.5 rounded ${dueDateInfo.className}`}>
              {dueDateInfo.text}
            </span>
          ) : (
            <span className="text-xs text-gray-500">{timeAgo}</span>
          )}
        </div>
      </div>

      {task.output && (
        <div className="mt-3 pt-3 border-t border-navy-600">
          <p className="text-xs text-gray-500 truncate">
            <span className="text-gray-400">Output:</span> {task.output}
          </p>
        </div>
      )}
    </div>
  );
}
