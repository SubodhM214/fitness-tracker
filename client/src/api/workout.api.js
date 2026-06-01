import api from "./axios";

export const getByMuscle = (group) => api.get(`/workouts/muscle/${group}`);
export const getTypesByMuscle = (group) => api.get(`/workouts/types/${group}`);
export const getAllWorkouts = () => api.get("/workouts");
