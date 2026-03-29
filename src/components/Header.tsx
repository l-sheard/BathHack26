import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "../contexts/UserContext";

export function Header() {
  const { user, loading } = useUser();
  return (
    <header className="sticky top-0 z-20 pt-4">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/75 px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-ocean to-mint bg-clip-text"
          >
            Group Trip Planner
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <nav className="text-sm font-semibold text-slate-500 flex gap-2">
              {!loading && !user && (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-sky-200 transition hover:bg-sky-500/35 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-full border border-mint-400/40 bg-mint-500/20 px-3 py-1.5 text-mint-200 transition hover:bg-mint-500/35 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {!loading && user && (
                <div title={user.email} className="rounded-full bg-slate-700 w-9 h-9 flex items-center justify-center text-white font-bold text-lg cursor-pointer">
                  <span role="img" aria-label="profile">👤</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
