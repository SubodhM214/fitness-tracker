import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ user: set.data.user, token });
    }
  },
}));
export default useAuthStore;
