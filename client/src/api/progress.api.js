import api from "./axios";

export const uploadPhoto = (formData) =>
  api.post("/progress/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getProgress = () => api.get("/progress");
export const deletePhoto = (id) => api.delete(`/progress/${id}`);
