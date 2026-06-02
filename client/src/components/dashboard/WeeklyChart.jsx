const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyChart({ weekMap }) {
  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const todayIndex = WEEK_DAYS.indexOf(todayName);

  const heights = WEEK_DAYS.map((day) =>
    weekMap?.[day] ? Math.min((weekMap[day] / 10) * 60, 60) : 0,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        This week
      </h2>
      <div className="flex items-end gap-1.5 h-16">
        {WEEK_DAYS.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-sm transition-all ${
                i === todayIndex
                  ? "bg-purple-600"
                  : heights[i] > 0
                    ? "bg-purple-200 dark:bg-purple-800"
                    : "bg-gray-100 dark:bg-gray-700"
              }`}
              style={{ height: `${heights[i] || 4}px` }}
            />
            <span className="text-[9px] text-gray-400">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyChart;
