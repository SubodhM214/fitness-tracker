const MUSCLES = [
  "chest",
  "back",
  "biceps",
  "triceps",
  "shoulders",
  "legs",
  "abs",
];

function MuscleSelector({ activeMuscle, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {MUSCLES.map((muscle) => (
        <button
          key={muscle}
          onClick={() => onSelect(muscle)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm capitalize font-medium transition-all
            ${
              activeMuscle === muscle
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
            }`}
        >
          {muscle}
        </button>
      ))}
    </div>
  );
}

export default MuscleSelector;
export { MUSCLES };
