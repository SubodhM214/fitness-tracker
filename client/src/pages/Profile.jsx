import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { updateProfile } from "../api/auth.api";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

const GOALS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "build_muscle", label: "Build muscle" },
  { value: "stay_fit", label: "Stay fit" },
  { value: "improve_endurance", label: "Improve endurance" },
];

const LEVELS = ["beginner", "intermediate", "advanced"];

function Profile() {
  const { user, setAuth, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    gender: user?.gender || "",
    weight: user?.weight || "",
    height: user?.height || "",
    fitnessGoal: user?.fitnessGoal || "stay_fit",
    experienceLevel: user?.experienceLevel || "beginner",
  });

  const bmi =
    form.weight && form.height
      ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(
          1,
        )
      : null;

  const bmiCategory = (b) => {
    if (!b) return null;
    if (b < 18.5)
      return { label: "Underweight", color: "text-blue-500", pct: 15 };
    if (b < 25) return { label: "Normal", color: "text-green-600", pct: 38 };
    if (b < 30)
      return { label: "Overweight", color: "text-yellow-500", pct: 62 };
    return { label: "Obese", color: "text-red-500", pct: 85 };
  };

  const bmiInfo = bmiCategory(bmi);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setAuth(res.data.user, token);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />

      {/* topbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Profile</h1>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="text-sm text-purple-600 font-medium"
        >
          {editing ? (saving ? "Saving..." : "Save") : "Edit"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-base font-semibold border-b border-purple-300 focus:outline-none text-gray-800 w-full"
                />
              ) : (
                <div className="text-base font-semibold text-gray-900">
                  {user?.name}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
              <div className="mt-1 inline-block text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                {GOALS.find((g) => g.value === user?.fitnessGoal)?.label ||
                  "Stay fit"}
              </div>
            </div>
          </div>

          {/* stats */}
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) =>
                      setForm({ ...form, height: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="175"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Fitness goal
                </label>
                <select
                  value={form.fitnessGoal}
                  onChange={(e) =>
                    setForm({ ...form, fitnessGoal: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">
                  Experience level
                </label>
                <div className="flex gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setForm({ ...form, experienceLevel: level })
                      }
                      className={`flex-1 py-1.5 rounded-xl text-xs capitalize transition-all
                        ${
                          form.experienceLevel === level
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {[
                  ["Age", user?.age ? `${user.age} years` : "—"],
                  ["Gender", user?.gender || "—"],
                  ["Height", user?.height ? `${user.height} cm` : "—"],
                  ["Weight", user?.weight ? `${user.weight} kg` : "—"],
                  ["Level", user?.experienceLevel || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* BMI card */}
        {bmi && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              BMI tracker
            </h2>
            <div className="flex items-baseline justify-between mb-3">
              <span className={`text-3xl font-bold ${bmiInfo?.color}`}>
                {bmi}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${bmiInfo?.color} bg-gray-50`}
              >
                {bmiInfo?.label}
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 to-red-500">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-700 transition-all"
                style={{
                  left: `${bmiInfo?.pct || 38}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>Under</span>
              <span>Normal</span>
              <span>Over</span>
              <span>Obese</span>
            </div>
          </div>
        )}

        {/* goals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Monthly goals
          </h2>
          {[
            {
              label: "Workouts completed",
              value: 18,
              max: 22,
              color: "bg-purple-500",
            },
            {
              label: "Streak target",
              value: user?.currentStreak || 0,
              max: 30,
              color: "bg-orange-400",
            },
          ].map((goal) => (
            <div key={goal.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{goal.label}</span>
                <span>
                  {goal.value}/{goal.max}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className={`h-1.5 rounded-full ${goal.color} transition-all`}
                  style={{
                    width: `${Math.min((goal.value / goal.max) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
      <Navbar />
    </div>
  );
}

export default Profile;
