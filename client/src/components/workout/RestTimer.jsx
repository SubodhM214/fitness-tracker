import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function RestTimer() {
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (secs <= 0) {
      setRunning(false);
      setSecs(90);
      toast("Rest over — next set! 💪", { icon: "⏱️" });
      return;
    }
    const interval = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [running, secs]);

  const format = () => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-purple-50 dark:bg-purple-950 rounded-2xl p-3 flex items-center justify-between">
      <div>
        <div className="text-xs text-purple-500 dark:text-purple-400 mb-0.5">
          Rest timer
        </div>
        <div
          className={`text-2xl font-bold tabular-nums
          ${secs <= 10 ? "text-red-500" : "text-purple-900 dark:text-purple-100"}`}
        >
          {format()}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm bg-white dark:bg-gray-800"
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setSecs(90);
          }}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800"
        >
          ↺
        </button>
      </div>
    </div>
  );
}

export default RestTimer;
