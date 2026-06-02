function StreakBanner({ streak }) {
  return (
    <div className="bg-purple-50 dark:bg-purple-950 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-lg">
          🔥
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {streak || 0}
            <span className="text-sm font-normal text-purple-600 dark:text-purple-400 ml-1">
              days
            </span>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            current streak
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-purple-500">Keep going!</div>
        {streak >= 7 && (
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
            🏆 7 day badge!
          </div>
        )}
      </div>
    </div>
  );
}

export default StreakBanner;
