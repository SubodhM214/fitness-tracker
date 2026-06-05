function TypeFilter({ types, activeType, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all
            ${
              activeType === type
                ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
            }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default TypeFilter;
