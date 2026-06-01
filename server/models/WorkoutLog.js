import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ["chest", "back", "biceps", "triceps", "shoulders", "legs", "abs"],
    },
    // NEW — stores "chest + biceps" for display
    muscleLabel: {
      type: String,
      default: null,
    },
    exercises: [
      {
        workout: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workout",
        },
        name: {
          type: String,
        },
        sets: {
          type: Number,
        },
        reps: {
          type: String,
        },
        // NEW — which muscle this specific exercise belongs to
        muscleGroup: {
          type: String,
          default: null,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalCompleted: {
      type: Number,
      default: 0,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// one log per user per day
workoutLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("WorkoutLog", workoutLogSchema);
