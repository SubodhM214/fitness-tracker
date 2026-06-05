import { MUSCLE_COLORS, DIFF_COLORS } from "./ExerciseList";

function PlanBuilder({ plan, onRemove, onUpdate, onStart, starting }) {
  if (plan.length === 0) return null;

  const planMuscles = [...new Set(plan.map((e) => e.muscleGroup))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-purple-800 p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          My plan
          <span className="ml-2 text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-2 py-0.5 rounded-full">
            {plan.length} exercises
          </span>
        </h2>
        <button
          onClick={() => onUpdate(null, null, null, "clearAll")}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      {/* muscle tags */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {planMuscles.map((mg) => (
          <span
            key={mg}
            className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg]}`}
          >
            {mg}
          </span>
        ))}
      </div>

      {/* exercise rows */}
      {plan.map((ex) => (
        <div
          key={ex._id}
          className="py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
        >
          {/* name + remove */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {ex.name}
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[ex.muscleGroup]}`}
              >
                {ex.muscleGroup}
              </span>
            </div>
            <button
              onClick={() => onRemove(ex._id)}
              className="text-xs text-red-400 hover:text-red-600 ml-2"
            >
              ✕
            </button>
          </div>

          {/* sets + reps controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* sets stepper */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-1.5">
              <span className="text-xs text-gray-400">Sets</span>
              <button
                onClick={() =>
                  onUpdate(ex._id, "customSets", Math.max(1, ex.customSets - 1))
                }
                className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700"
              >
                −
              </button>
              <span className="text-sm font-semibold text-gray-800 dark:text-white w-4 text-center">
                {ex.customSets}
              </span>
              <button
                onClick={() =>
                  onUpdate(
                    ex._id,
                    "customSets",
                    Math.min(10, ex.customSets + 1),
                  )
                }
                className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700"
              >
                +
              </button>
            </div>

            {/* reps input */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-1.5">
              <span className="text-xs text-gray-400">Reps</span>
              <input
                type="text"
                value={ex.customReps}
                onChange={(e) => onUpdate(ex._id, "customReps", e.target.value)}
                className="w-14 text-sm font-semibold text-gray-800 dark:text-white bg-transparent focus:outline-none text-center border-b border-gray-300 dark:border-gray-500 focus:border-purple-400"
                placeholder="10"
              />
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full ${DIFF_COLORS[ex.difficulty]}`}
            >
              {ex.difficulty}
            </span>
          </div>
        </div>
      ))}

      {/* start button */}
      <button
        onClick={onStart}
        disabled={starting}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
      >
        {starting
          ? "Starting..."
          : `Start workout (${plan.length} exercises) 🔥`}
      </button>
    </div>
  );
}

export default PlanBuilder;
