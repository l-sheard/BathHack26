import { Link, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { CreateTripPage } from "./pages/CreateTripPage";
import { JoinTripPage } from "./pages/JoinTripPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { TripDashboardPage } from "./pages/TripDashboardPage";
import { GenerationPage } from "./pages/GenerationPage";
import { TripOptionsPage } from "./pages/TripOptionsPage";
import { TripOptionDetailPage } from "./pages/TripOptionDetailPage";

function App() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-20 pt-4">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/75 px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-ocean to-mint bg-clip-text"
          >
            Group Trip Planner
          </Link>
          <nav className="text-sm font-semibold text-slate-500">
            <Link to="/create" className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-sky-200 transition hover:bg-sky-500/35 hover:text-white">
              Create Trip
            </Link>
          </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateTripPage />} />
          <Route path="/trip/:tripId/join" element={<JoinTripPage />} />
          <Route path="/trip/:tripId/preferences/:participantId" element={<PreferencesPage />} />
          <Route path="/trip/:tripId/dashboard" element={<TripDashboardPage />} />
          <Route path="/trip/:tripId/generate" element={<GenerationPage />} />
          <Route path="/trip/:tripId/options" element={<TripOptionsPage />} />
          <Route path="/trip/:tripId/options/:optionId" element={<TripOptionDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
