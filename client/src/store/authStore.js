import { create } from "zustand";

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return { token: null, user: null };
    const user = JSON.parse(userStr);
    if (!user) return { token: null, user: null };
    return { token, user };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
};

const useAuthStore = create((set) => ({
  ...getInitialAuth(),

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
    const { token, user } = getInitialAuth();
    set({ token, user });
  },
}));

export default useAuthStore;
