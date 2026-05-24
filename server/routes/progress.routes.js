import express from "express";
import {
  uploadPhoto,
  getProgress,
  deletePhoto,
} from "../controllers/progress.controller.js";
import protect from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/upload", protect, upload.single("photo"), uploadPhoto);
router.get("/", protect, getProgress);
router.delete("/:id", protect, deletePhoto);

export default router;
