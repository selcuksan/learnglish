import {
  AlertTriangle,
  BookOpen,
  Brain,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { cn } from "../lib/utils";
import { useWords } from "../state/WordsProvider";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: Brain },
  { to: "/mistakes", label: "Mistakes", icon: AlertTriangle },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { meta } = useWords();

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:gap-6 lg:px-8">
        <aside className="glass-panel mb-4 rounded-[2rem] border border-white/60 p-4 shadow-[0_24px_80px_rgba(29,44,76,0.12)] lg:mb-0 lg:flex lg:w-[290px] lg:flex-col lg:justify-between lg:p-6">
          <div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">
                Learnglish
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Build your active vocabulary.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review the right words, keep momentum, and stay close to the
                NGSL core.
              </p>
            </div>

            <nav className="grid gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                        : "bg-white/50 text-slate-700 hover:bg-white",
                    )
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                  <span className="text-xs opacity-70">/</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-8 rounded-3xl bg-linear-to-br from-amber-500 to-orange-500 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              Dataset
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {meta?.totalWords ?? "..."}
            </p>
            <p className="mt-1 text-sm text-white/80">
              core words available for study
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
