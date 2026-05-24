import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // --- Profile info ---
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    // --- Body stats ---
    weight: {
      type: Number, // in kg
      default: null,
    },
    height: {
      type: Number, // in cm
      default: null,
    },

    // --- Fitness goal ---
    fitnessGoal: {
      type: String,
      enum: ["lose_weight", "build_muscle", "stay_fit", "improve_endurance"],
      default: "stay_fit",
    },

    // --- Experience level (used for workout suggestions) ---
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // --- Profile photo (Cloudinary URL) ---
    profilePhoto: {
      type: String,
      default: null,
    },

    // --- Workout streak ---
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastWorkoutDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
