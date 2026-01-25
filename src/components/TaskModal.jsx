import { useState, useEffect } from 'react';

const STATUSES = ['Recurring', 'Backlog', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const ASSIGNEES = ['Zach', 'Henry'];
const RECURRENCE_OPTIONS = [
  { value: '', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export function TaskModal({ task, onSave, onDelete, onClose, projects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignees: [],
    priority: 'Medium',
    project: '',
    status: 'Backlog',
    output: '',
    dueDate: '',
    recurrence: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignees: task.assignees || [],
        priority: task.priority || 'Medium',
        project: task.project || '',
        status: task.status || 'Backlog',
        output: task.output || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        recurrence: task.recurrence || '',
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave({
      ...formData,
      dueDate: formData.dueDate || null,
      recurrence: formData.recurrence || null,
    });
  };

  const toggleAssignee = (assignee) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(assignee)
        ? prev.assignees.filter((a) => a !== assignee)
        : [...prev.assignees, assignee],
    }));
  };

  const isEditing = !!task?.id;

  // Quick date buttons
  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-navy-800 rounded-2xl w-full max-w-lg border border-navy-600 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-navy-700 sticky top-0 bg-navy-800">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Enter task title..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Due Date
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-3 py-1 text-xs bg-navy-700 text-gray-300 rounded hover:bg-navy-600 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-3 py-1 text-xs bg-navy-700 text-gray-300 rounded hover:bg-navy-600 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="px-3 py-1 text-xs bg-navy-700 text-gray-300 rounded hover:bg-navy-600 transition-colors"
              >
                Next Week
              </button>
              {formData.dueDate && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dueDate: '' })}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Recurrence
            </label>
            <select
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {formData.recurrence && (
              <p className="text-xs text-gray-500 mt-1">
                🔄 When completed, a new task will be created with the next due date
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Assignees
            </label>
            <div className="flex gap-2">
              {ASSIGNEES.map((assignee) => (
                <button
                  key={assignee}
                  type="button"
                  onClick={() => toggleAssignee(assignee)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.assignees.includes(assignee)
                      ? 'bg-accent text-white'
                      : 'bg-navy-700 text-gray-400 hover:bg-navy-600'
                  }`}
                >
                  {assignee}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Project
            </label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              list="projects"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="e.g., Backend, Design, Auth..."
            />
            <datalist id="projects">
              {projects.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Output / Link
            </label>
            <input
              type="text"
              value={formData.output}
              onChange={(e) => setFormData({ ...formData, output: e.target.value })}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="PR link, doc path, etc..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
