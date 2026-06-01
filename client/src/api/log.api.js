import api from "./axios";

export const startWorkout = (data) => api.post("/logs/start", data);
export const getTodayLog = () => api.get("/logs/today");
export const completeExercise = (data) =>
  api.put("/logs/complete-exercise", data);
export const getHeatmapData = () => api.get("/logs/heatmap");
export const getHistory = () => api.get("/logs/history");
export const getStats = () => api.get("/logs/stats");
