import WorkoutLog from "../models/WorkoutLog.js";
import User from "../models/User.js";

const getToday = () => new Date().toISOString().split("T")[0];

// ── streak logic ──────────────────────────────────────────
const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const lastDate = user.lastWorkoutDate
      ? new Date(user.lastWorkoutDate).toISOString().split("T")[0]
      : null;

    // already updated streak today — don't double count
    if (lastDate === today) return;

    if (lastDate === yesterdayStr) {
      // worked out yesterday — extend streak
      user.currentStreak += 1;
    } else {
      // missed a day — reset to 1
      user.currentStreak = 1;
    }

    user.lastWorkoutDate = new Date();
    await user.save();
  } catch (err) {
    console.error("Streak update failed:", err.message);
  }
};

// ── POST /api/logs/start ──────────────────────────────────
export const startWorkout = async (req, res) => {
  try {
    const { muscleGroup, muscleLabel, exercises } = req.body;
    const today = getToday();

    // validate
    if (!muscleGroup || !exercises || exercises.length === 0) {
      return res
        .status(400)
        .json({ message: "muscleGroup and exercises are required" });
    }

    // if log already exists for today, return it
    // this prevents duplicate logs if user hits start twice
    const existing = await WorkoutLog.findOne({
      user: req.user._id,
      date: today,
    });
    if (existing) {
      return res.json(existing);
    }

    const log = await WorkoutLog.create({
      user: req.user._id,
      date: today,
      muscleGroup, // primary muscle (first one)
      muscleLabel: muscleLabel || muscleGroup, // display label eg "chest + biceps"
      exercises: exercises.map((ex) => ({
        workout: ex._id || null,
        name: ex.name,
        sets: Number(ex.sets) || 3,
        reps: String(ex.reps) || "10",
        muscleGroup: ex.muscleGroup || muscleGroup, // per-exercise muscle
        completed: false,
      })),
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("startWorkout error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/logs/today ───────────────────────────────────
export const getTodayLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({
      user: req.user._id,
      date: getToday(),
    });

    // return null if no log — frontend handles this gracefully
    res.json(log || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/logs/complete-exercise ──────────────────────
export const completeExercise = async (req, res) => {
  try {
    const { exerciseId, completed } = req.body;

    if (!exerciseId || completed === undefined) {
      return res
        .status(400)
        .json({ message: "exerciseId and completed are required" });
    }

    const log = await WorkoutLog.findOne({
      user: req.user._id,
      date: getToday(),
    });

    if (!log) {
      return res.status(404).json({ message: "No workout started today" });
    }

    // find the exercise inside the log by its subdocument _id
    const exercise = log.exercises.id(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found in log" });
    }

    // update completion status
    exercise.completed = completed;

    // recalculate totals
    log.totalCompleted = log.exercises.filter((e) => e.completed).length;
    log.isComplete = log.totalCompleted === log.exercises.length;

    await log.save();

    // update streak only when full workout is complete
    if (log.isComplete) {
      await updateStreak(req.user._id);
    }

    res.json(log);
  } catch (err) {
    console.error("completeExercise error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/logs/heatmap ─────────────────────────────────
export const getHeatmapData = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const fromDate = ninetyDaysAgo.toISOString().split("T")[0];

    const logs = await WorkoutLog.find({
      user: req.user._id,
      date: { $gte: fromDate },
    }).select("date totalCompleted isComplete muscleGroup muscleLabel");

    // format for react-calendar-heatmap
    // count: 0 = no workout, 1 = partial, 3 = complete
    const heatmapData = logs.map((log) => ({
      date: log.date,
      count: log.isComplete ? 3 : log.totalCompleted > 0 ? 1 : 0,
      muscleGroup: log.muscleLabel || log.muscleGroup, // show full label on hover
    }));

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/logs/history ─────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30)
      .select(
        "date muscleGroup muscleLabel totalCompleted isComplete exercises",
      );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/logs/stats ───────────────────────────────────
// NEW — used by dashboard for weekly chart and muscle frequency
export const getStats = async (req, res) => {
  try {
    // last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split("T")[0];

    const logs = await WorkoutLog.find({
      user: req.user._id,
      date: { $gte: fromDate },
    }).select("date muscleGroup muscleLabel totalCompleted isComplete");

    // build a map of day → workout for the weekly chart
    // key is day name (Mon, Tue...), value is number of exercises completed
    const weekMap = {};
    logs.forEach((log) => {
      const dayName = new Date(log.date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      weekMap[dayName] = (weekMap[dayName] || 0) + log.totalCompleted;
    });

    // muscle frequency — how many times each muscle trained this week
    const muscleFreq = {};
    logs.forEach((log) => {
      const label = log.muscleLabel || log.muscleGroup;
      label.split(" + ").forEach((mg) => {
        const m = mg.trim();
        muscleFreq[m] = (muscleFreq[m] || 0) + 1;
      });
    });

    res.json({
      weekMap,
      muscleFreq,
      totalThisWeek: logs.length,
      completedThisWeek: logs.filter((l) => l.isComplete).length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
