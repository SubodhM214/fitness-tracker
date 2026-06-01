import { useState } from "react";

const MUSCLE_BADGE = {
  chest: "bg-blue-50 text-blue-700",
  back: "bg-green-50 text-green-700",
  biceps: "bg-purple-50 text-purple-700",
  triceps: "bg-orange-50 text-orange-700",
  shoulders: "bg-yellow-50 text-yellow-700",
  legs: "bg-teal-50 text-teal-700",
  abs: "bg-pink-50 text-pink-700",
};

const DIFF_BADGE = {
  beginner: "bg-green-50 text-green-600",
  intermediate: "bg-yellow-50 text-yellow-600",
  advanced: "bg-red-50 text-red-600",
};

function WorkoutCard({ exercise, muscleGroup, isLogMode, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(exercise.completed || false);

  const handleCheck = () => {
    const newVal = !checked;
    setChecked(newVal);
    if (onToggle) onToggle(newVal);
  };

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div
        className="flex items-center gap-3 py-2.5 cursor-pointer"
        onClick={() => !isLogMode && setExpanded((e) => !e)}
      >
        {/* check circle — only in log mode */}
        {isLogMode ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCheck();
            }}
            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border transition-all
              ${
                checked
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300"
              }`}
          >
            {checked && <span className="text-xs">✓</span>}
          </button>
        ) : (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${MUSCLE_BADGE[muscleGroup]}`}
          >
            <span className="text-sm">💪</span>
          </div>
        )}

        {/* exercise info */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium truncate ${
              isLogMode && checked
                ? "text-gray-400 line-through"
                : "text-gray-800"
            }`}
          >
            {exercise.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {!isLogMode && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${DIFF_BADGE[exercise.difficulty]}`}
              >
                {exercise.difficulty}
              </span>
            )}
            {!isLogMode && (
              <span className="text-[10px] text-gray-400">
                {exercise.workoutType}
              </span>
            )}
          </div>
        </div>

        {/* sets x reps */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-gray-700">
            {exercise.sets}×{exercise.reps}
          </div>
          {!isLogMode && (
            <div className="text-[10px] text-gray-400">
              {exercise.equipment}
            </div>
          )}
        </div>
      </div>

      {/* expanded instructions — only in browse mode */}
      {!isLogMode && expanded && exercise.instructions && (
        <div className="mb-3 ml-12 p-3 bg-gray-50 rounded-xl">
          <div className="text-xs text-gray-500 leading-relaxed">
            💡 {exercise.instructions}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutCard;
