import { useState } from "react";
import { completeExercise } from "../../api/log.api";
import toast from "react-hot-toast";

const MUSCLE_COLORS = {
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

function ActiveWorkout({ todayLog, setTodayLog }) {
  const handleComplete = async (exerciseId, completed) => {
    // optimistic update
    setTodayLog((prev) => {
      if (!prev) return prev;
      const updated = prev.exercises.map((e) =>
        e._id === exerciseId ? { ...e, completed } : e,
      );
      return {
        ...prev,
        exercises: updated,
        totalCompleted: updated.filter((e) => e.completed).length,
      };
    });
    try {
      const res = await completeExercise({ exerciseId, completed });
      setTodayLog(res.data);
      if (res.data.isComplete) toast.success("Workout complete! 🎉");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const muscleLabels = (todayLog.muscleLabel || todayLog.muscleGroup).split(
    " + ",
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Today's workout
        </h2>
        <span className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full">
          {todayLog.totalCompleted}/{todayLog.exercises.length} done
        </span>
      </div>

      {/* muscle tags */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {muscleLabels.map((mg) => (
          <span
            key={mg}
            className={`text-xs px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg.trim()] || "bg-gray-100 text-gray-500"}`}
          >
            {mg.trim()}
          </span>
        ))}
      </div>

      {/* progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
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

      {/* exercises */}
      {todayLog.exercises.map((ex) => (
        <div
          key={ex._id}
          className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0"
        >
          <button
            onClick={() => handleComplete(ex._id, !ex.completed)}
            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all
              ${
                ex.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 dark:border-gray-500 hover:border-purple-400"
              }`}
          >
            {ex.completed && <span className="text-[10px] font-bold">✓</span>}
          </button>

          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-medium truncate ${
                ex.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {ex.name}
            </div>
            {ex.muscleGroup && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[ex.muscleGroup] || "bg-gray-100 text-gray-500"}`}
              >
                {ex.muscleGroup}
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
            {ex.sets}×{ex.reps}
          </div>
        </div>
      ))}

      {todayLog.isComplete && (
        <div className="mt-3 text-center bg-green-50 dark:bg-green-900 rounded-xl p-3">
          <div className="text-xl mb-1">🎉</div>
          <div className="text-sm font-semibold text-green-700 dark:text-green-300">
            Workout complete!
          </div>
          <div className="text-xs text-green-500 mt-0.5">Streak updated</div>
        </div>
      )}
    </div>
  );
}

export default ActiveWorkout;
