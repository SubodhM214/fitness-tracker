import express from "express";
import {
  getAllWorkouts,
  getByMuscle,
  getByMuscleAndType,
  getTypesByMuscle,
  getWorkoutById,
} from "../controllers/workout.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllWorkouts);
router.get("/muscle/:group", protect, getByMuscle);
router.get("/muscle/:group/type/:type", protect, getByMuscleAndType);
router.get("/types/:group", protect, getTypesByMuscle);
router.get("/:id", protect, getWorkoutById);

export default router;
