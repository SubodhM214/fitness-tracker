import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getTodayLog, getStats } from "../api/log.api";
import { getByMuscle } from "../api/workout.api";
import { startWorkout, completeExercise } from "../api/log.api";
import { getMe } from "../api/auth.api";
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
  chest: "bg-blue-50 text-blue-700",
  back: "bg-green-50 text-green-700",
  biceps: "bg-purple-50 text-purple-700",
  triceps: "bg-orange-50 text-orange-700",
  shoulders: "bg-yellow-50 text-yellow-700",
  legs: "bg-teal-50 text-teal-700",
  abs: "bg-pink-50 text-pink-700",
};

const DIFF_COLORS = {
  beginner: "bg-green-50 text-green-600",
  intermediate: "bg-yellow-50 text-yellow-600",
  advanced: "bg-red-50 text-red-600",
};

const DEFAULT_SETS = 3;
const DEFAULT_REPS = "10";

function Dashboard() {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();

  const [todayLog, setTodayLog] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // planner states
  const [showPlanner, setShowPlanner] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState("chest");
  const [exercises, setExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(false);
  const [activeType, setActiveType] = useState("All");
  const [types, setTypes] = useState(["All"]);
  const [plan, setPlan] = useState([]); // exercises user picked
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // fetch exercises when muscle changes inside planner
  useEffect(() => {
    if (showPlanner) fetchExercises(selectedMuscle);
  }, [selectedMuscle, showPlanner]);

  const fetchDashboard = async () => {
    try {
      const [meRes, logRes, statsRes] = await Promise.all([
        getMe(),
        getTodayLog(),
        getStats(),
      ]);
      setAuth(meRes.data.user, token);
      setTodayLog(logRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

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
      setActiveType("All");
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
        equipment: exercise.equipment,
        sets: exercise.sets,
        reps: exercise.reps,
        customSets: DEFAULT_SETS,
        customReps: String(DEFAULT_REPS),
      },
    ]);
    toast.success(`${exercise.name} added!`);
  };

  const removeFromPlan = (id) =>
    setPlan((prev) => prev.filter((e) => e._id !== id));

  const updatePlan = (id, field, value) => {
    setPlan((prev) =>
      prev.map((e) => (e._id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleStartWorkout = async () => {
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
      setTodayLog(res.data);
      setShowPlanner(false);
      setPlan([]);
      toast.success("Workout started! 🔥");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteExercise = async (exerciseId, completed) => {
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

  // BMI calculation
  const bmi =
    user?.weight && user?.height
      ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
      : null;

  const bmiInfo = (b) => {
    if (!b) return null;
    if (b < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (b < 25) return { label: "Normal", color: "text-green-600" };
    if (b < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  };

  const bmiData = bmiInfo(bmi);

  // weekly chart — real data from stats
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekHeights = weekDays.map((day) =>
    stats?.weekMap?.[day] ? Math.min((stats.weekMap[day] / 10) * 60, 60) : 0,
  );
  const todayDayName = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });
  const todayIndex = weekDays.indexOf(todayDayName);

  const filteredExercises =
    activeType === "All"
      ? exercises
      : exercises.filter((e) => e.workoutType === activeType);

  const planMuscles = [...new Set(plan.map((e) => e.muscleGroup))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />

      {/* topbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 text-lg">⚡</span>
          <span className="font-semibold text-gray-900">FitTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Hey, {user?.name?.split(" ")[0]}
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* greeting */}
        <p className="text-sm text-gray-500">
          Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </p>

        {/* streak banner */}
        <div className="bg-purple-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
              🔥
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {user?.currentStreak || 0}
                <span className="text-sm font-normal text-purple-600 ml-1">
                  days
                </span>
              </div>
              <div className="text-xs text-purple-600">current streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-500">Keep going!</div>
            {user?.currentStreak >= 7 && (
              <div className="text-xs text-purple-700 font-medium mt-1">
                🏆 7 day badge!
              </div>
            )}
          </div>
        </div>

        {/* metric cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-900">
              {user?.weight ?? "—"}
              <span className="text-xs font-normal text-gray-400 ml-0.5">
                kg
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Weight</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <div
              className={`text-lg font-bold ${bmiData?.color || "text-gray-900"}`}
            >
              {bmi ?? "—"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {bmiData?.label || "BMI"}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-900">
              {stats?.totalThisWeek ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">This week</div>
          </div>
        </div>

        {/* ── TODAY'S WORKOUT SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          {/* case 1 — no workout today, not planning */}
          {!todayLog && !showPlanner && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">💪</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                No workout planned today
              </div>
              <div className="text-xs text-gray-400 mb-4">
                Build your plan — choose your muscles, exercises, sets and reps
              </div>
              <button
                onClick={() => setShowPlanner(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                + Add workout plan
              </button>
            </div>
          )}

          {/* case 2 — planner open */}
          {!todayLog && showPlanner && (
            <div>
              {/* planner header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">
                  Build today's plan
                </h2>
                <button
                  onClick={() => {
                    setShowPlanner(false);
                    setPlan([]);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕ Cancel
                </button>
              </div>

              {/* muscle selector */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">
                  Select muscle group
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {MUSCLES.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscle(muscle)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize font-medium transition-all
                        ${
                          selectedMuscle === muscle
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
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
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* exercise list */}
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
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
                        className="flex items-center gap-3 px-3 py-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {ex.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFF_COLORS[ex.difficulty]}`}
                            >
                              {ex.difficulty}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {ex.workoutType}
                            </span>
                            <span className="text-[10px] text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400">
                              Suggested {ex.sets}×{ex.reps}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToPlan(ex)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all
                            ${
                              inPlan
                                ? "bg-green-100 text-green-600"
                                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                            }`}
                        >
                          {inPlan ? "✓" : "+"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* my plan — selected exercises with custom sets/reps */}
              {plan.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-purple-700">
                      My plan — {plan.length} exercises
                    </div>
                    <div className="flex gap-1.5">
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
                      className="bg-white rounded-xl px-3 py-2.5 mb-2 last:mb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-800 truncate flex-1">
                          {ex.name}
                        </div>
                        <button
                          onClick={() => removeFromPlan(ex._id)}
                          className="text-xs text-red-400 ml-2 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>

                      {/* sets stepper + reps input inline */}
                      <div className="flex items-center gap-2">
                        {/* sets */}
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                          <span className="text-[10px] text-gray-400 mr-1">
                            Sets
                          </span>
                          <button
                            onClick={() =>
                              updatePlan(
                                ex._id,
                                "customSets",
                                Math.max(1, ex.customSets - 1),
                              )
                            }
                            className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-purple-100 hover:text-purple-700"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-gray-800 w-4 text-center">
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
                            className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-purple-100 hover:text-purple-700"
                          >
                            +
                          </button>
                        </div>

                        {/* reps */}
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                          <span className="text-[10px] text-gray-400 mr-1">
                            Reps
                          </span>
                          <input
                            type="text"
                            value={ex.customReps}
                            onChange={(e) =>
                              updatePlan(ex._id, "customReps", e.target.value)
                            }
                            className="w-12 text-sm font-bold text-gray-800 bg-transparent focus:outline-none text-center border-b border-gray-300 focus:border-purple-400"
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

                  {/* start button */}
                  <button
                    onClick={handleStartWorkout}
                    disabled={starting}
                    className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                  >
                    {starting
                      ? "Starting..."
                      : `Start workout (${plan.length} exercises) 🔥`}
                  </button>
                </div>
              )}

              {plan.length === 0 && !loadingEx && (
                <div className="text-center text-xs text-gray-400 py-2">
                  Tap <span className="font-semibold text-purple-500">+</span>{" "}
                  on any exercise above
                </div>
              )}
            </div>
          )}

          {/* case 3 — workout active, show progress */}
          {todayLog && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Today's workout
                </h2>
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  {todayLog.totalCompleted}/{todayLog.exercises.length} done
                </span>
              </div>

              {/* muscles in session */}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {(todayLog.muscleLabel || todayLog.muscleGroup)
                  .split(" + ")
                  .map((mg) => (
                    <span
                      key={mg}
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[mg.trim()] || "bg-gray-100 text-gray-500"}`}
                    >
                      {mg.trim()}
                    </span>
                  ))}
              </div>

              {/* progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      todayLog.exercises.length > 0
                        ? (todayLog.totalCompleted /
                            todayLog.exercises.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* exercise rows */}
              {todayLog.exercises.map((ex) => (
                <div
                  key={ex._id}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <button
                    onClick={() =>
                      handleCompleteExercise(ex._id, !ex.completed)
                    }
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all
                      ${
                        ex.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                  >
                    {ex.completed && (
                      <span className="text-[10px] font-bold">✓</span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${ex.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
                    >
                      {ex.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {ex.muscleGroup && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MUSCLE_COLORS[ex.muscleGroup] || "bg-gray-100 text-gray-500"}`}
                        >
                          {ex.muscleGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-gray-500 flex-shrink-0">
                    {ex.sets}×{ex.reps}
                  </div>
                </div>
              ))}

              {todayLog.isComplete && (
                <div className="mt-3 text-center bg-green-50 rounded-xl p-3">
                  <div className="text-xl mb-1">🎉</div>
                  <div className="text-sm font-semibold text-green-700">
                    Workout complete!
                  </div>
                  <div className="text-xs text-green-500 mt-0.5">
                    Streak updated
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* weekly chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            This week
          </h2>
          <div className="flex items-end gap-1.5 h-16">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    i === todayIndex
                      ? "bg-purple-600"
                      : weekHeights[i] > 0
                        ? "bg-purple-200"
                        : "bg-gray-100"
                  }`}
                  style={{ height: `${weekHeights[i] || 4}px` }}
                />
                <span className="text-[9px] text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* profile nudge */}
        {(!user?.weight || !user?.height) && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-800">
                Complete your profile
              </div>
              <div className="text-xs text-amber-600 mt-0.5">
                Add height & weight to track BMI
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg"
            >
              Update
            </button>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default Dashboard;
