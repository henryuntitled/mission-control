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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      {/* Filters - stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Assignee filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Assignee:</span>
          <div className="flex bg-navy-800 rounded-lg p-0.5 sm:p-1 border border-navy-700">
            {ASSIGNEES.map((assignee) => (
              <button
                key={assignee}
                onClick={() => setAssigneeFilter(assignee)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all ${
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

        {/* Project filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Project:</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-navy-800 border border-navy-700 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-accent"
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

      {/* New Task button */}
      <button
        onClick={onNewTask}
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>
  );
}
