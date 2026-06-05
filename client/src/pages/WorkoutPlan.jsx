import { useEffect, useState } from "react";
import useWorkoutStore from "../store/workoutStore";
import useAuthStore from "../store/authStore";
import { getByMuscle } from "../api/workout.api";
import { startWorkout, getTodayLog, completeExercise } from "../api/log.api";
import Navbar from "../components/Navbar";
import MuscleSelector from "../components/workout/MuscleSelector";
import TypeFilter from "../components/workout/TypeFilter";
import ExerciseList from "../components/workout/ExerciseList";
import PlanBuilder from "../components/workout/PlanBuilder";
import ActiveWorkout from "../components/workout/ActiveWorkout";
import RestTimer from "../components/workout/RestTimer";
import toast, { Toaster } from "react-hot-toast";

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
  const [viewMode, setViewMode] = useState("build");

  useEffect(() => {
    fetchExercises(activeMuscle);
    setActiveType("All");
  }, [activeMuscle]);

  useEffect(() => {
    fetchTodayLog();
  }, []);

  const fetchExercises = async (muscle) => {
    setLoading(true);
    try {
      const res = await getByMuscle(muscle);
      setAllExercises(res.data);
      setTypes(["All", ...new Set(res.data.map((e) => e.workoutType))]);
    } catch {
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
    } catch {
      toast.error("Failed to load today's workout");
    }
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

  const updatePlan = (id, field, value, action) => {
    if (action === "clearAll") {
      setSelectedPlan([]);
      return;
    }
    setSelectedPlan((prev) =>
      prev.map((e) => (e._id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleStartWorkout = async () => {
    if (selectedPlan.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    const muscleGroups = [...new Set(selectedPlan.map((e) => e.muscleGroup))];
    setStarting(true);
    try {
      const res = await startWorkout({
        muscleGroup: muscleGroups[0],
        muscleLabel: muscleGroups.join(" + "),
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
      toast.success("Workout started! 🔥");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteExercise = async (exerciseId, completed) => {
    updateExerciseInLog(exerciseId, completed);
    try {
      const res = await completeExercise({ exerciseId, completed });
      setTodayLog(res.data);
      if (res.data.isComplete) toast.success("Workout complete! 🎉");
    } catch {
      updateExerciseInLog(exerciseId, !completed);
      toast.error("Failed to update");
    }
  };

  const filteredExercises =
    activeType === "All"
      ? allExercises
      : allExercises.filter((e) => e.workoutType === activeType);

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
        {viewMode === "active" && todayLog ? (
          <>
            <RestTimer />
            <ActiveWorkout
              todayLog={todayLog}
              onComplete={handleCompleteExercise}
            />
          </>
        ) : (
          <>
            <MuscleSelector
              activeMuscle={activeMuscle}
              onSelect={setActiveMuscle}
            />
            <PlanBuilder
              plan={selectedPlan}
              onRemove={(id) =>
                setSelectedPlan((prev) => prev.filter((e) => e._id !== id))
              }
              onUpdate={updatePlan}
              onStart={handleStartWorkout}
              starting={starting}
            />
            <TypeFilter
              types={types}
              activeType={activeType}
              onSelect={setActiveType}
            />
            <ExerciseList
              exercises={filteredExercises}
              activeMuscle={activeMuscle}
              selectedPlan={selectedPlan}
              onAdd={addToPlan}
              loading={loading}
            />
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
