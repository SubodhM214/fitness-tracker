import { useState, useEffect } from "react";
import { getByMuscle } from "../../api/workout.api";
import { startWorkout } from "../../api/log.api";
import toast from "react-hot-toast";

const MUSCLES = [
  "chest",
  "back",
  "biceps",
  "triceps",
  "shoulders",
  "legs",
  "abs",
];

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

const DIFF_COLORS = {
  beginner: "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300",
};

function WorkoutPlanner({ onWorkoutStarted, onCancel }) {
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [exercises, setExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(false);
  const [activeType, setActiveType] = useState("All");
  const [types, setTypes] = useState(["All"]);
  const [plan, setPlan] = useState([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchExercises(selectedMuscle);
    setActiveType("All");
  }, [selectedMuscle]);

  const fetchExercises = async (muscle) => {
    setLoadingEx(true);
    try {
      const res = await getByMuscle(muscle);
      setExercises(res.data);
      const uniqueTypes = [
        "All",
        ...new Set(res.data.map((e) => e.workoutType)),
      ];
      setTypes(uniqueTypes);
    } catch (err) {
      toast.error("Failed to load exercises");
    } finally {
      setLoadingEx(false);
    }
  };

  const addToPlan = (exercise) => {
    if (plan.find((e) => e._id === exercise._id)) {
      toast("Already in plan", { icon: "👀" });
      return;
    }
    setPlan((prev) => [
      ...prev,
      {
        _id: exercise._id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        difficulty: exercise.difficulty,
        sets: exercise.sets,
        reps: exercise.reps,
        customSets: 3,
        customReps: "10",
      },
    ]);
    toast.success(`${exercise.name} added!`);
  };

  const removeFromPlan = (id) =>
    setPlan((prev) => prev.filter((e) => e._id !== id));

  const updatePlan = (id, field, value) =>
    setPlan((prev) =>
      prev.map((e) => (e._id === id ? { ...e, [field]: value } : e)),
    );

  const handleStart = async () => {
    if (plan.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    const muscleGroups = [...new Set(plan.map((e) => e.muscleGroup))];
    setStarting(true);
    try {
      const res = await startWorkout({
        muscleGroup: muscleGroups[0],
        muscleLabel: muscleGroups.join(" + "),
        exercises: plan.map((ex) => ({
          _id: ex._id,
          name: ex.name,
          sets: Number(ex.customSets),
          reps: String(ex.customReps),
          muscleGroup: ex.muscleGroup,
        })),
      });
      onWorkoutStarted(res.data);
      toast.success("Workout started! 🔥");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  const filteredExercises =
    activeType === "All"
      ? exercises
      : exercises.filter((e) => e.workoutType === activeType);

  const planMuscles = [...new Set(plan.map((e) => e.muscleGroup))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Build today's plan
        </h2>
        <button
          onClick={() => {
            onCancel();
            setPlan([]);
          }}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕ Cancel
        </button>
      </div>

      {/* muscle selector */}
      <div className="text-xs text-gray-400 mb-2">Select muscle group</div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {MUSCLES.map((muscle) => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(muscle)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize font-medium transition-all
              ${
                selectedMuscle === muscle
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              }`}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all
              ${
                activeType === type
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* exercise list */}
      <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden mb-3">
        {loadingEx ? (
          <div className="text-center py-6 text-sm text-gray-400">
            Loading...
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const inPlan = plan.find((e) => e._id === ex._id);
            return (
              <div
                key={ex._id}
                className="flex items-center gap-3 px-3 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {ex.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFF_COLORS[ex.difficulty]}`}
                    >
                      {ex.difficulty}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {ex.workoutType}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      · Suggested {ex.sets}×{ex.reps}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addToPlan(ex)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all
                    ${
                      inPlan
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                        : "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200"
                    }`}
                >
                  {inPlan ? "✓" : "+"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* selected plan */}
      {plan.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-950 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              My plan — {plan.length} exercises
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {planMuscles.map((mg) => (
                <span
                  key={mg}
                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg]}`}
                >
                  {mg}
                </span>
              ))}
            </div>
          </div>

          {plan.map((ex) => (
            <div
              key={ex._id}
              className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-2 last:mb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate flex-1">
                  {ex.name}
                </div>
                <button
                  onClick={() => removeFromPlan(ex._id)}
                  className="text-xs text-red-400 ml-2"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* sets stepper */}
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-gray-400 mr-1">Sets</span>
                  <button
                    onClick={() =>
                      updatePlan(
                        ex._id,
                        "customSets",
                        Math.max(1, ex.customSets - 1),
                      )
                    }
                    className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-800 dark:text-white w-4 text-center">
                    {ex.customSets}
                  </span>
                  <button
                    onClick={() =>
                      updatePlan(
                        ex._id,
                        "customSets",
                        Math.min(10, ex.customSets + 1),
                      )
                    }
                    className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* reps input */}
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-gray-400 mr-1">Reps</span>
                  <input
                    type="text"
                    value={ex.customReps}
                    onChange={(e) =>
                      updatePlan(ex._id, "customReps", e.target.value)
                    }
                    className="w-12 text-sm font-bold text-gray-800 dark:text-white bg-transparent focus:outline-none text-center border-b border-gray-300 dark:border-gray-500 focus:border-purple-400"
                    placeholder="10"
                  />
                </div>

                <span
                  className={`text-[10px] px-2 py-1 rounded-full ml-auto ${DIFF_COLORS[ex.difficulty]}`}
                >
                  {ex.difficulty}
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={handleStart}
            disabled={starting}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
          >
            {starting
              ? "Starting..."
              : `Start workout (${plan.length} exercises) 🔥`}
          </button>
        </div>
      )}

      {plan.length === 0 && !loadingEx && (
        <div className="text-center text-xs text-gray-400 py-2">
          Tap <span className="font-semibold text-purple-500">+</span> on any
          exercise above
        </div>
      )}
    </div>
  );
}

export default WorkoutPlanner;
