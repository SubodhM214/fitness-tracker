import { useEffect, useState } from "react";
import useWorkoutStore from "../store/workoutStore";
import useAuthStore from "../store/authStore";
import { getByMuscle } from "../api/workout.api";
import { startWorkout, getTodayLog, completeExercise } from "../api/log.api";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

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

const DEFAULT_SETS = 3;
const DEFAULT_REPS = "10";

function WorkoutPlan() {
  const {
    activeMuscle,
    setActiveMuscle,
    todayLog,
    setTodayLog,
    updateExerciseInLog,
  } = useWorkoutStore();
  const { user } = useAuthStore();

  const [allExercises, setAllExercises] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState([]);
  const [activeType, setActiveType] = useState("All");
  const [types, setTypes] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [timerSecs, setTimerSecs] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [viewMode, setViewMode] = useState("build");

  useEffect(() => {
    fetchExercises(activeMuscle);
    setActiveType("All");
  }, [activeMuscle]);

  useEffect(() => {
    fetchTodayLog();
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    if (timerSecs <= 0) {
      setTimerRunning(false);
      setTimerSecs(90);
      toast("Rest over — next set! 💪", { icon: "⏱️" });
      return;
    }
    const interval = setInterval(() => setTimerSecs((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSecs]);

  const fetchExercises = async (muscle) => {
    setLoading(true);
    try {
      const res = await getByMuscle(muscle);
      setAllExercises(res.data);
      const uniqueTypes = [
        "All",
        ...new Set(res.data.map((e) => e.workoutType)),
      ];
      setTypes(uniqueTypes);
    } catch (err) {
      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLog = async () => {
    try {
      const res = await getTodayLog();
      if (res.data) {
        setTodayLog(res.data);
        setViewMode("active");
      }
    } catch (err) {}
  };

  const addToPlan = (exercise) => {
    if (selectedPlan.find((e) => e._id === exercise._id)) {
      toast("Already in your plan", { icon: "👀" });
      return;
    }
    setSelectedPlan((prev) => [
      ...prev,
      {
        _id: exercise._id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        workoutType: exercise.workoutType,
        difficulty: exercise.difficulty,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        sets: exercise.sets,
        reps: exercise.reps,
        customSets: DEFAULT_SETS,
        customReps: String(DEFAULT_REPS),
      },
    ]);
    toast.success(`${exercise.name} added!`);
  };

  const removeFromPlan = (id) =>
    setSelectedPlan((prev) => prev.filter((e) => e._id !== id));

  const updatePlanExercise = (id, field, value) =>
    setSelectedPlan((prev) =>
      prev.map((e) => (e._id === id ? { ...e, [field]: value } : e)),
    );

  const handleStartWorkout = async () => {
    if (selectedPlan.length === 0) {
      toast.error("Add at least one exercise to your plan");
      return;
    }
    const muscleGroups = [...new Set(selectedPlan.map((e) => e.muscleGroup))];
    const muscleLabel = muscleGroups.join(" + ");
    setStarting(true);
    try {
      const res = await startWorkout({
        muscleGroup: muscleGroups[0],
        muscleLabel,
        exercises: selectedPlan.map((ex) => ({
          _id: ex._id,
          name: ex.name,
          sets: Number(ex.customSets),
          reps: String(ex.customReps),
          muscleGroup: ex.muscleGroup,
        })),
      });
      setTodayLog(res.data);
      setSelectedPlan([]);
      setViewMode("active");
      toast.success("Workout started! Let's go 🔥");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start workout");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteExercise = async (exerciseId, completed) => {
    updateExerciseInLog(exerciseId, completed);
    try {
      const res = await completeExercise({ exerciseId, completed });
      setTodayLog(res.data);
      if (res.data.isComplete)
        toast.success("Workout complete! Streak updated 🎉");
    } catch (err) {
      updateExerciseInLog(exerciseId, !completed);
      toast.error("Failed to update");
    }
  };

  const formatTimer = () => {
    const m = Math.floor(timerSecs / 60);
    const s = timerSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const filteredExercises =
    activeType === "All"
      ? allExercises
      : allExercises.filter((e) => e.workoutType === activeType);

  const planMuscles = [...new Set(selectedPlan.map((e) => e.muscleGroup))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Toaster position="top-center" />

      {/* topbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-gray-900 dark:text-white">
            Workout plan
          </h1>
          <div className="flex items-center gap-2">
            {todayLog && (
              <button
                onClick={() =>
                  setViewMode((v) => (v === "active" ? "build" : "active"))
                }
                className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-3 py-1 rounded-full"
              >
                {viewMode === "active" ? "＋ Add more" : "↩ My workout"}
              </button>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {user?.experienceLevel || "beginner"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* ── ACTIVE WORKOUT VIEW ── */}
        {viewMode === "active" && todayLog ? (
          <>
            {/* rest timer */}
            <div className="bg-purple-50 dark:bg-purple-950 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-500 dark:text-purple-400 mb-0.5">
                  Rest timer
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums ${timerSecs <= 10 ? "text-red-500" : "text-purple-900 dark:text-purple-100"}`}
                >
                  {formatTimer()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimerRunning((r) => !r)}
                  className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm bg-white dark:bg-gray-800"
                >
                  {timerRunning ? "⏸ Pause" : "▶ Start"}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSecs(90);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800"
                >
                  ↺
                </button>
              </div>
            </div>

            {/* session label */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Today:
              </span>
              {(todayLog.muscleLabel || todayLog.muscleGroup)
                .split(" + ")
                .map((mg) => (
                  <span
                    key={mg}
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg.trim()] || "bg-gray-100 text-gray-500"}`}
                  >
                    {mg}
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
                  width: `${todayLog.exercises.length > 0 ? (todayLog.totalCompleted / todayLog.exercises.length) * 100 : 0}%`,
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
                    onClick={() =>
                      handleCompleteExercise(ex._id, !ex.completed)
                    }
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all
                      ${
                        ex.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 dark:border-gray-500 hover:border-purple-400"
                      }`}
                  >
                    {ex.completed && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${ex.completed ? "text-gray-400 line-through" : "text-gray-800 dark:text-gray-100"}`}
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
        ) : (
          <>
            {/* ── BUILD PLAN VIEW ── */}

            {/* muscle tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MUSCLES.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setActiveMuscle(muscle)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm capitalize font-medium transition-all
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

            {/* selected plan */}
            {selectedPlan.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-purple-800 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    My plan
                    <span className="ml-2 text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-2 py-0.5 rounded-full">
                      {selectedPlan.length} exercises
                    </span>
                  </h2>
                  <button
                    onClick={() => setSelectedPlan([])}
                    className="text-xs text-red-400"
                  >
                    Clear all
                  </button>
                </div>

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

                {selectedPlan.map((ex) => (
                  <div
                    key={ex._id}
                    className="py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                  >
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
                        onClick={() => removeFromPlan(ex._id)}
                        className="text-xs text-red-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* sets */}
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-400">
                          Sets
                        </span>
                        <button
                          onClick={() =>
                            updatePlanExercise(
                              ex._id,
                              "customSets",
                              Math.max(1, ex.customSets - 1),
                            )
                          }
                          className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white w-4 text-center">
                          {ex.customSets}
                        </span>
                        <button
                          onClick={() =>
                            updatePlanExercise(
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

                      {/* reps */}
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-1.5">
                        <span className="text-xs text-gray-400">Reps</span>
                        <input
                          type="text"
                          value={ex.customReps}
                          onChange={(e) =>
                            updatePlanExercise(
                              ex._id,
                              "customReps",
                              e.target.value,
                            )
                          }
                          className="w-14 text-sm font-semibold text-gray-800 dark:text-white bg-transparent focus:outline-none text-center border-b border-gray-300 dark:border-gray-500 focus:border-purple-400"
                          placeholder="10"
                        />
                      </div>

                      <div
                        className={`text-xs px-2 py-1 rounded-full ${DIFF_COLORS[ex.difficulty]}`}
                      >
                        {ex.difficulty}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleStartWorkout}
                  disabled={starting}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
                >
                  {starting
                    ? "Starting..."
                    : `Start workout (${selectedPlan.length} exercises) 🔥`}
                </button>
              </div>
            )}

            {/* type filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
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

            {/* exercise browser */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
                  {activeMuscle} exercises
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${MUSCLE_COLORS[activeMuscle]}`}
                >
                  {filteredExercises.length} exercises
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  Loading...
                </div>
              ) : (
                filteredExercises.map((ex) => {
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
                          onClick={() => addToPlan(ex)}
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

            {selectedPlan.length === 0 && !loading && (
              <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
                Tap <span className="font-semibold text-purple-500">+</span> on
                any exercise to build your plan
              </div>
            )}
          </>
        )}
      </div>
      <Navbar />
    </div>
  );
}

export default WorkoutPlan;
