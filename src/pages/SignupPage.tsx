import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream dark:bg-black overflow-hidden">
      {/* Big purple glow background in bottom right */}
      <div className="pointer-events-none absolute z-0 h-[700px] w-[700px] right-[-250px] bottom-[-250px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.32)_0%,rgba(124,58,237,0.18)_60%,rgba(59,130,246,0.12)_80%,transparent_100%)] blur-[120px]" />
      <Card className="relative z-10 w-full max-w-md space-y-6 border-violet-400/35 shadow-[0_25px_60px_rgba(124,58,237,0.35)]">
        <h2 className="font-display text-2xl font-bold text-center">Sign Up</h2>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
        />
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="new-password"
        />
        {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-sm font-semibold">Signup successful! Redirecting...</div>}
        <Button
          className="w-full"
          disabled={signupLoading}
          onClick={async () => {
            setError(null);
            setSuccess(false);
            setSignupLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            setSignupLoading(false);
            if (error) {
              setError(error.message);
            } else {
              setSuccess(true);
              setTimeout(() => navigate("/dashboard"), 1500);
            }
          }}
        >
          {signupLoading ? "Signing up..." : "Sign Up"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>Already have an account? Log in</Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>Back to Home</Button>
      </Card>
    </div>
  );
}
