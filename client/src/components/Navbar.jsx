import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/workout", label: "Workout", icon: "🏋" },
  { to: "/progress", label: "Progress", icon: "📷" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

function Navbar() {
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
    </nav>
  );
}

export default Navbar;
