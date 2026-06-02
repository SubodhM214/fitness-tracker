function MetricCards({ user, bmi, bmiData, totalThisWeek }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {user?.weight ?? "—"}
          <span className="text-xs font-normal text-gray-400 ml-0.5">kg</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Weight</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
        <div
          className={`text-lg font-bold ${bmiData?.color || "text-gray-900 dark:text-white"}`}
        >
          {bmi ?? "—"}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {bmiData?.label || "BMI"}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {totalThisWeek ?? 0}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">This week</div>
      </div>
    </div>
  );
}

export default MetricCards;
