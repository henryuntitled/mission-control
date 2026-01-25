import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

const columnColors = {
  Recurring: 'bg-purple-500',
  Backlog: 'bg-gray-500',
  'In Progress': 'bg-blue-500',
  'In Review': 'bg-yellow-500',
  Done: 'bg-green-500',
};

export function Column({ title, tasks, onTaskClick, onAddTask, isMobile = false }) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div 
      className={`flex flex-col bg-navy-800 rounded-xl transition-all duration-200 ${
        isOver ? 'ring-2 ring-accent ring-opacity-50 bg-navy-700' : ''
      } ${
        isMobile 
          ? 'w-full min-h-[60vh]' 
          : 'min-w-[280px] w-[280px] max-h-[calc(100vh-220px)]'
      }`}
    >
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${columnColors[title]}`} />
          <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
          <span className="text-xs text-gray-500 bg-navy-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={() => onAddTask(title)}
            className="text-gray-400 hover:text-accent transition-colors p-1 hover:bg-navy-700 rounded"
            title={`Add task to ${title}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 min-h-[100px] ${
          isOver ? 'bg-accent/5' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className={`text-xs text-center py-8 ${isOver ? 'text-accent' : 'text-gray-500'}`}>
            {isOver ? 'Drop here' : 'No tasks'}
          </p>
        )}
      </div>
    </div>
  );
}
