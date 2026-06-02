import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getTodayLog, getStats } from "../api/log.api";
import { getMe } from "../api/auth.api";
import Navbar from "../components/Navbar";
import StreakBanner from "../components/dashboard/StreakBanner";
import MetricCards from "../components/dashboard/MetricCards";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import WorkoutPlanner from "../components/dashboard/WorkoutPlanner";
import ActiveWorkout from "../components/dashboard/ActiveWorkout";
import toast, { Toaster } from "react-hot-toast";

function Dashboard() {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();

  const [todayLog, setTodayLog] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlanner, setShowPlanner] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [meRes, logRes, statsRes] = await Promise.all([
        getMe(),
        getTodayLog(),
        getStats(),
      ]);
      setAuth(meRes.data.user, token);
      setTodayLog(logRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const bmi =
    user?.weight && user?.height
      ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
      : null;

  const bmiData = (() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  })();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Toaster position="top-center" />

      {/* topbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 text-lg">⚡</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            FitTrack
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Hey, {user?.name?.split(" ")[0]}
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-semibold text-purple-700 dark:text-purple-300">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Good {greeting}, {user?.name?.split(" ")[0]} 👋
        </p>

        <StreakBanner streak={user?.currentStreak} />

        <MetricCards
          user={user}
          bmi={bmi}
          bmiData={bmiData}
          totalThisWeek={stats?.totalThisWeek}
        />

        {/* today's workout section */}
        {!todayLog && !showPlanner && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center py-8">
            <div className="text-4xl mb-3">💪</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              No workout planned today
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Build your plan — choose muscles, exercises, sets and reps
            </div>
            <button
              onClick={() => setShowPlanner(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
            >
              + Add workout plan
            </button>
          </div>
        )}

        {!todayLog && showPlanner && (
          <WorkoutPlanner
            onWorkoutStarted={(log) => {
              setTodayLog(log);
              setShowPlanner(false);
            }}
            onCancel={() => setShowPlanner(false)}
          />
        )}

        {todayLog && (
          <ActiveWorkout todayLog={todayLog} setTodayLog={setTodayLog} />
        )}

        <WeeklyChart weekMap={stats?.weekMap} />

        {/* profile nudge */}
        {(!user?.weight || !user?.height) && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Complete your profile
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Add height & weight to track BMI
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg"
            >
              Update
            </button>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}

export default Dashboard;
