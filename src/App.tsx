import { Link, Route, Routes } from "react-router-dom";
// import { ThemeToggle } from "./components/ThemeToggle";
// import { signInWithGoogle } from "./lib/signInWithGoogle";
import { LandingPage } from "./pages/LandingPage";
import { UserProvider } from "./contexts/UserContext";
import { CreateTripPage } from "./pages/CreateTripPage";
import { JoinTripPage } from "./pages/JoinTripPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { TripDashboardPage } from "./pages/TripDashboardPage";
import { GenerationPage } from "./pages/GenerationPage";
import { TripOptionsPage } from "./pages/TripOptionsPage";
import { TripOptionDetailPage } from "./pages/TripOptionDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SignupPage } from "./pages/SignupPage";

import { Header } from "./components/Header";

function App() {
  // Render pastel glow background only in light mode
  return (
    <UserProvider>
      <div
        className="min-h-screen bg-white text-black relative"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(167, 139, 250, 0.30), transparent 35%)," +
            "radial-gradient(circle at 75% 18%, rgba(244, 114, 182, 0.22), transparent 32%)," +
            "radial-gradient(circle at 65% 75%, rgba(96, 165, 250, 0.22), transparent 35%)," +
            "radial-gradient(circle at 30% 85%, rgba(196, 181, 253, 0.18), transparent 30%)," +
            "linear-gradient(180deg, #FAFAFD 0%, #F7F5FF 100%)",
        }}
      >
        {/* Light mode background canvas glows (always rendered, but only visible in light mode via CSS) */}
        <div className="glow-lavender" aria-hidden="true" />
        <div className="glow-pink" aria-hidden="true" />
        <div className="glow-blue" aria-hidden="true" />
        <Header />

        {/* Back button just below the top banner, only for TripDashboardPage route */}
        {window.location.pathname.match(/^\/trip\/[^/]+\/dashboard/) && (
          <div className="relative z-30 w-full">
            <button
              className="ml-6 mt-6 rounded-full bg-black/30 px-4 py-1 text-sm text-black hover:bg-black/50 transition"
              onClick={() => window.history.back()}
            >
              0 Back
            </button>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateTripPage />} />
            <Route path="/trip/:tripId/join" element={<JoinTripPage />} />
            <Route
              path="/trip/:tripId/preferences/:participantId"
              element={<PreferencesPage />}
            />
            <Route
              path="/trip/:tripId/dashboard"
              element={<TripDashboardPage />}
            />
            <Route
              path="/trip/:tripId/generation"
              element={<GenerationPage />}
            />
            <Route path="/trip/:tripId/options" element={<TripOptionsPage />} />
            <Route
              path="/trip/:tripId/options/:optionId"
              element={<TripOptionDetailPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
