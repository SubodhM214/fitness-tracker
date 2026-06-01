import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  loadFromStorage: () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      // only proceed if both exist
      if (!token || !userStr) return;

      const user = JSON.parse(userStr);

      // make sure parse didn't return null
      if (!user) return;

      set({ token, user });
    } catch (err) {
      // if anything goes wrong, clear storage and start fresh
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));

export default useAuthStore;
