import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
} from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe); // protected — must be logged in
router.put("/profile", protect, updateProfile); // protected — must be logged in

export default router;
