import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/toast";

const NAV_ITEMS = [
  { to: "/", end: true, label: "Dashboard", icon: "📊" },
  { to: "/books", end: false, label: "Books", icon: "📚" },
  { to: "/data", end: false, label: "Backup & Import", icon: "💾" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? user.full_name || user.username || "Admin" : "Admin";
  const initial = (displayName.trim()[0] || "A").toUpperCase();

  const handleLogout = () => {
    logout();
    toast("Logged out of admin panel", "success");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? "bg-amber-500 text-stone-900"
        : "text-stone-400 hover:text-white hover:bg-stone-800"
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2.5 px-4 pt-6 pb-8 shrink-0">
        <span className="w-9 h-9 rounded-xl bg-amber-500 text-white grid place-items-center shadow-sm">
          🛠️
        </span>
        <div>
          <span className="font-display text-lg font-semibold text-white block leading-tight">
            Book<span className="text-amber-500">Store</span>
          </span>
          <span className="text-[11px] uppercase tracking-widest text-stone-500">Admin Panel</span>
        </div>
      </Link>

      <nav className="flex-1 px-3 space-y-1 thin-scroll overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <a
          href="https://magenta-dieffenbachia-043f38.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <span className="w-5 text-center">🛍️</span>
          View Store
        </a>
      </nav>

      <div className="p-3 border-t border-stone-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="w-9 h-9 rounded-lg bg-stone-800 text-amber-400 grid place-items-center font-bold text-sm">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-stone-500 truncate">{user ? user.email : ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="w-5 text-center">↪</span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-stone-900">{sidebarContent}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-stone-900 h-full">{sidebarContent}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-stone-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border border-stone-200 text-stone-700"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-display text-lg sm:text-xl font-semibold text-stone-900">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                user && user.is_admin
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {user && user.is_admin ? "Admin" : "Staff"}
            </span>
            <span className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 grid place-items-center font-bold text-sm">
              {initial}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
