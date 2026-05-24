import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ message: "Fitness Tracker API is running!" });
});

// connect DB then start server
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
