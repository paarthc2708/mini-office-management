import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/employees", label: "Employees", icon: "👥" },
  { to: "/leaves", label: "Leave Requests", icon: "🗂️" },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-navy-900 text-slate-200">
      <div className="px-5 py-6">
        <h1 className="text-lg font-semibold text-white">OfficeFlow</h1>
        <p className="mt-0.5 text-xs text-slate-400">Office management</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-navy-700 hover:text-white"
              }`
            }
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-500">
        Mini Office Management System
      </div>
    </div>
  );
}
