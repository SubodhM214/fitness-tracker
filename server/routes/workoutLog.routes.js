import express from "express";
import {
  startWorkout,
  getTodayLog,
  completeExercise,
  getHeatmapData,
  getHistory,
  getStats,
} from "../controllers/workoutLog.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", protect, startWorkout);
router.get("/today", protect, getTodayLog);
router.put("/complete-exercise", protect, completeExercise);
router.get("/heatmap", protect, getHeatmapData);
router.get("/history", protect, getHistory);
router.get("/stats", protect, getStats);

export default router;
