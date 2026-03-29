
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useUser } from "../contexts/UserContext";


export function DashboardPage() {
  const { user } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      if (!user) {
        setTrips([]);
        setLoading(false);
        return;
      }
      // Filter trips by user_id
      const { data, error } = await supabase.from("trips").select("*").eq("user_id", user.id);
      if (!error) setTrips(data || []);
      setLoading(false);
    }
    fetchTrips();
  }, [user]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Big purple glow background across the whole page */}
      <div className="pointer-events-none fixed z-0 h-[900px] w-[900px] right-[-300px] bottom-[-300px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.32)_0%,rgba(124,58,237,0.18)_60%,rgba(59,130,246,0.12)_80%,transparent_100%)] blur-[140px]" />
      <div className="relative mx-auto max-w-2xl py-12">
        <Card className="space-y-6 bg-white/15 backdrop-blur-md shadow-lg">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <h2 className="font-display text-2xl font-bold text-center">Your Trips</h2>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/create')}>Create Trip</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>Join Trip</Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-slate-400">Loading...</div>
        ) : trips.length === 0 ? (
          <div className="text-center text-slate-400">No trips found.</div>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="rounded-xl bg-white/5 px-4 py-3 text-ink shadow cursor-pointer hover:bg-violet-500/10 transition"
                onClick={() => navigate(`/trip/${trip.id}/dashboard`)}
              >
                <div className="font-semibold">{trip.name || `Trip #${trip.id}`}</div>
                <div className="text-xs text-slate-500">{trip.destination || "No destination"}</div>
                {/* Add more trip status/details here if available */}
              </li>
            ))}
          </ul>
        )}
        </Card>
      </div>
    </div>
  );
}
