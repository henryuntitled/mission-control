export function StatsBar({ stats }) {
  const statItems = [
    { label: 'This Week', value: stats.thisWeek, icon: '📅' },
    { label: 'In Progress', value: stats.inProgress, icon: '🔄' },
    { label: 'Total Tasks', value: stats.total, icon: '📋' },
    { label: 'Completion', value: `${stats.completion}%`, icon: '✅' },
  ];

  return (
    <div className="flex gap-6">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 bg-navy-800 rounded-lg px-4 py-3 border border-navy-700"
        >
          <span className="text-lg">{item.icon}</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
            <p className="text-xl font-semibold text-white">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
