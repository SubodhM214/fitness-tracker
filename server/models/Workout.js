import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ["chest", "back", "biceps", "triceps", "shoulders", "legs", "abs"],
    },
    workoutType: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    reps: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructions: {
      type: String,
      default: "",
    },
    equipment: {
      type: String,
      default: "bodyweight",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Workout", workoutSchema);
