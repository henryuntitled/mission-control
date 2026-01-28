const ASSIGNEES = ['All', 'Zach', 'Henry'];

export function FilterBar({
  assigneeFilter,
  setAssigneeFilter,
  projectFilter,
  setProjectFilter,
  projects,
  onNewTask,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Top row: Search + New Task */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-navy-800 border border-navy-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onNewTask}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* Bottom row: Filters */}
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
    </div>
  );
}
