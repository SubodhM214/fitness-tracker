import Workout from "../models/Workout.js";

export const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ muscleGroup: 1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getByMuscle = async (req, res) => {
  try {
    const { group } = req.params;

    const validGroups = [
      "chest",
      "back",
      "biceps",
      "triceps",
      "shoulders",
      "legs",
      "abs",
    ];
    if (!validGroups.includes(group)) {
      return res.status(400).json({
        message: `Invalid muscle group. Must be one of: ${validGroups.join(", ")}`,
      });
    }

    const workouts = await Workout.find({ muscleGroup: group });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getByMuscleAndType = async (req, res) => {
  try {
    const { group, type } = req.params;

    const workouts = await Workout.find({
      muscleGroup: group,
      workoutType: type,
    });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTypesByMuscle = async (req, res) => {
  try {
    const { group } = req.params;
    const types = await Workout.distinct("workoutType", { muscleGroup: group });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
