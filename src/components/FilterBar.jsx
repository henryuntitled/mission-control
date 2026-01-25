const ASSIGNEES = ['All', 'Zach', 'Henry'];

export function FilterBar({
  assigneeFilter,
  setAssigneeFilter,
  projectFilter,
  setProjectFilter,
  projects,
  onNewTask,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Assignee:</span>
          <div className="flex bg-navy-800 rounded-lg p-1 border border-navy-700">
            {ASSIGNEES.map((assignee) => (
              <button
                key={assignee}
                onClick={() => setAssigneeFilter(assignee)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  assigneeFilter === assignee
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {assignee}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Project:</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="All">All Projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onNewTask}
        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>
  );
}
