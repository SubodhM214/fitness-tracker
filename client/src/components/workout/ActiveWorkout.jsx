import { MUSCLE_COLORS } from "./ExerciseList";

function ActiveWorkout({ todayLog, onComplete }) {
  const muscleLabels = (todayLog.muscleLabel || todayLog.muscleGroup).split(
    " + ",
  );

  return (
    <>
      {/* session label */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 dark:text-gray-500">Today:</span>
        {muscleLabels.map((mg) => (
          <span
            key={mg}
            className={`text-xs px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg.trim()] || "bg-gray-100 text-gray-500"}`}
          >
            {mg.trim()}
          </span>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
          {todayLog.totalCompleted}/{todayLog.exercises.length} done
        </span>
      </div>

      {/* progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-500"
          style={{
            width: `${
              todayLog.exercises.length > 0
                ? (todayLog.totalCompleted / todayLog.exercises.length) * 100
                : 0
            }%`,
          }}
        />
      </div>

      {/* exercise list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        {todayLog.exercises.map((ex) => (
          <div
            key={ex._id}
            className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
          >
            <button
              onClick={() => onComplete(ex._id, !ex.completed)}
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all
                ${
                  ex.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 dark:border-gray-500 hover:border-purple-400"
                }`}
            >
              {ex.completed && <span className="text-xs font-bold">✓</span>}
            </button>

            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium ${
                  ex.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {ex.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {ex.muscleGroup && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[ex.muscleGroup] || "bg-gray-100 text-gray-500"}`}
                  >
                    {ex.muscleGroup}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {ex.sets} sets × {ex.reps} reps
                </span>
              </div>
            </div>

            <div
              className={`text-xs font-semibold px-2 py-1 rounded-xl flex-shrink-0 ${MUSCLE_COLORS[ex.muscleGroup] || "bg-gray-100 text-gray-500"}`}
            >
              {ex.sets}×{ex.reps}
            </div>
          </div>
        ))}

        {todayLog.isComplete && (
          <div className="mt-4 text-center bg-green-50 dark:bg-green-900 rounded-xl p-4">
            <div className="text-2xl mb-1">🎉</div>
            <div className="text-sm font-semibold text-green-700 dark:text-green-300">
              Workout complete!
            </div>
            <div className="text-xs text-green-500 dark:text-green-400 mt-0.5">
              Streak updated
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ActiveWorkout;
