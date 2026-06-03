import { NavLink } from "react-router-dom";
import useThemeStore from "../store/themeStore";
const tabs = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/workout", label: "Workout", icon: "🏋" },
  { to: "/progress", label: "Progress", icon: "📷" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

function Navbar() {
  const { isDark, toggleTheme } = useThemeStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors
            ${isActive ? "text-purple-600" : "text-gray-400 hover:text-gray-600"}`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center py-3 px-3 gap-1 text-xs text-gray-400 dark:text-gray-500"
        aria-label="Toggle dark mode"
      >
        <span className="text-xl leading-none">{isDark ? "☀️" : "🌙"}</span>
        <span>{isDark ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
}

export default Navbar;
