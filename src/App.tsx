import { Link, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { CreateTripPage } from "./pages/CreateTripPage";
import { JoinTripPage } from "./pages/JoinTripPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { TripDashboardPage } from "./pages/TripDashboardPage";

function App() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-ocean">
            Group Trip Planner
          </Link>
          <nav className="text-sm font-medium text-slate-600">
            <Link to="/create" className="hover:text-ocean">
              Create Trip
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateTripPage />} />
          <Route path="/trip/:tripId/join" element={<JoinTripPage />} />
          <Route path="/trip/:tripId/preferences/:participantId" element={<PreferencesPage />} />
          <Route path="/trip/:tripId/dashboard" element={<TripDashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
