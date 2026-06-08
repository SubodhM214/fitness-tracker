import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import workoutLogRoutes from "./routes/workoutLog.routes.js";
import progressRoutes from "./routes/progress.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      process.env.ALLOWED_ORIGIN, // production (update after Vercel deploy)
      /\.vercel\.app$/, // any vercel preview URL
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/logs", workoutLogRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Fitness Tracker API is running!" });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
