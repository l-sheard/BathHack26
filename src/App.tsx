import { Link, Route, Routes } from "react-router-dom";
import { ThemeToggle } from "./components/ThemeToggle";
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
  return (
    <UserProvider>
      <div className="min-h-screen bg-cream text-ink">
        <Header />

      {/* Back button just below the top banner, only for TripDashboardPage route */}
      {window.location.pathname.match(/^\/trip\/[^/]+\/dashboard/) && (
        <div className="relative z-30 w-full">
          <button
            className="ml-6 mt-6 rounded-full bg-black/30 px-4 py-1 text-sm text-white hover:bg-black/50 transition"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
        </div>
      )}

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
