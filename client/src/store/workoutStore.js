import { create } from "zustand";

const useWorkoutStore = create((set) => ({
  activeMuscle: "chest",
  exercises: [],
  todayLog: null,

  setActiveMuscle: (muscle) => set({ activeMuscle: muscle }),
  setExercises: (exercises) => set({ exercises }),
  setTodayLog: (log) => set({ todayLog: log }),

  // toggle one exercise as complete inside the log
  updateExerciseInLog: (exerciseId, completed) =>
    set((state) => {
      if (!state.todayLog) return state;
      const updated = state.todayLog.exercises.map((ex) =>
        ex._id === exerciseId ? { ...ex, completed } : ex,
      );
      return {
        todayLog: {
          ...state.todayLog,
          exercises: updated,
          totalCompleted: updated.filter((e) => e.completed).length,
        },
      };
    }),
}));

export default useWorkoutStore;
