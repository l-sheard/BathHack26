import { Link, useNavigate } from "react-router-dom";
// import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "../contexts/UserContext";
import { signOut } from "../lib/signOut";

export function Header() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 pt-4 bg-transparent">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div
          className="navbar flex items-center justify-between px-4 py-3"
          style={{
            background: "transparent",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "none",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            borderRadius: "0",
            transition: "background 0.2s, border 0.2s",
          }}
        >
          <Link to="/" className="flex items-center" aria-label="Home">
            <img
              src="/logo26.png"
              alt="Group Trip Planner Logo"
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <nav className="text-sm font-semibold text-black flex gap-2 items-center">
              {!loading && !user && (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-black transition hover:bg-sky-500/35 hover:text-black"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-full border border-mint-400/40 bg-mint-500/20 px-3 py-1.5 text-black transition hover:bg-mint-500/35 hover:text-black"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {!loading && user && (
                <>
                  <div
                    title={user.email}
                    className="rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors bg-slate-700 text-black dark:bg-slate-700 dark:text-black bg-white text-black"
                    style={{
                      background: "var(--profile-bg, #fff)",
                      color: "var(--profile-fg, #1A1625)",
                    }}
                    onClick={() => navigate("/dashboard")}
                    data-theme-profile
                  >
                    <span role="img" aria-label="profile">
                      👤
                    </span>
                  </div>
                  <button
                    className="ml-2 px-3 py-1.5 rounded-full bg-slate-200 text-black hover:bg-slate-300 font-semibold transition"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    title="Logout"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
