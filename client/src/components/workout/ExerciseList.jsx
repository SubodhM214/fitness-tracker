export const MUSCLE_COLORS = {
  chest: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  back: "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200",
  biceps:
    "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  triceps:
    "bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  shoulders:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  legs: "bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-200",
  abs: "bg-pink-50 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
};

export const DIFF_COLORS = {
  beginner: "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300",
};

function ExerciseList({
  exercises,
  activeMuscle,
  selectedPlan,
  onAdd,
  loading,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
          {activeMuscle} exercises
        </h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${MUSCLE_COLORS[activeMuscle]}`}
        >
          {exercises.length} exercises
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-400">Loading...</div>
      ) : (
        exercises.map((ex) => {
          const inPlan = selectedPlan.find((e) => e._id === ex._id);
          return (
            <div
              key={ex._id}
              className="py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${MUSCLE_COLORS[activeMuscle]}`}
                >
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {ex.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFF_COLORS[ex.difficulty]}`}
                    >
                      {ex.difficulty}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {ex.workoutType}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      · {ex.equipment}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Suggested: {ex.sets} sets × {ex.reps} reps
                  </div>
                </div>

                <button
                  onClick={() => onAdd(ex)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all
                    ${
                      inPlan
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                        : "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200"
                    }`}
                >
                  {inPlan ? "✓" : "+"}
                </button>
              </div>

              {ex.instructions && (
                <div className="mt-2 ml-12 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                  💡 {ex.instructions}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ExerciseList;
