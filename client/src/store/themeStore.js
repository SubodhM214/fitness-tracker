import { create } from "zustand";

const useThemeStore = create((set) => ({
  isDark: localStorage.getItem("theme") === "dark",

  toggleTheme: () => {
    set((state) => {
      const newDark = !state.isDark;
      // add or remove 'dark' class on <html>
      document.documentElement.classList.toggle("dark", newDark);
      localStorage.setItem("theme", newDark ? "dark" : "light");
      return { isDark: newDark };
    });
  },

  initTheme: () => {
    const saved = localStorage.getItem("theme");
    // also respect OS preference if no saved setting
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    set({ isDark });
  },
}));

export default useThemeStore;
