import WorkoutLog from "../models/WorkoutLog.js";
import User from "../models/User.js";

const getToday = () => new Date().toISOString().split("T")[0];

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = getToday();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const lastDate = user.lastWorkoutDate
    ? new Date(user.lastWorkoutDate).toISOString().split("T")[0]
    : null;

  if (lastDate === today) {
    return;
  } else if (lastDate === yesterdayStr) {
    user.currentStreak += 1;
  } else {
    user.currentStreak = 1;
  }

  user.lastWorkoutDate = new Date();
  await user.save();
};

export const startWorkout = async (req, res) => {
  try {
    const { muscleGroup, exercises } = req.body;
    const today = getToday();

    let log = await WorkoutLog.findOne({ user: req.user._id, date: today });

    if (log) {
      return res.json(log);
    }

    log = await WorkoutLog.create({
      user: req.user._id,
      date: today,
      muscleGroup,
      exercises: exercises.map((ex) => ({
        workout: ex._id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        completed: false,
      })),
    });

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodayLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({
      user: req.user._id,
      date: getToday(),
    });

    res.json(log || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeExercise = async (req, res) => {
  try {
    const { exerciseId, completed } = req.body;

    const log = await WorkoutLog.findOne({
      user: req.user._id,
      date: getToday(),
    });

    if (!log) {
      return res.status(404).json({ message: "No workout started today" });
    }

    const exercise = log.exercises.id(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found in log" });
    }

    exercise.completed = completed;
    log.totalCompleted = log.exercises.filter((e) => e.completed).length;
    log.isComplete = log.totalCompleted === log.exercises.length;

    await log.save();

    if (log.isComplete) {
      await updateStreak(req.user._id);
    }

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHeatmapData = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const fromDate = ninetyDaysAgo.toISOString().split("T")[0];

    const logs = await WorkoutLog.find({
      user: req.user._id,
      date: { $gte: fromDate },
    }).select("date totalCompleted isComplete muscleGroup");

    const heatmapData = logs.map((log) => ({
      date: log.date,
      count: log.isComplete ? 3 : log.totalCompleted > 0 ? 1 : 0,
      muscleGroup: log.muscleGroup,
    }));

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
