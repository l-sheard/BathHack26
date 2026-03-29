import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useState } from "react";
import { signInWithEmail } from "../lib/signInWithEmail";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">
      {/* Big purple glow background in bottom right */}
      <div className="pointer-events-none absolute z-0 h-[700px] w-[700px] right-[-250px] bottom-[-250px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.32)_0%,rgba(124,58,237,0.18)_60%,rgba(59,130,246,0.12)_80%,transparent_100%)] blur-[120px]" />
      <Card className="relative z-10 w-full max-w-md space-y-6 border-violet-400/35 shadow-[0_25px_60px_rgba(124,58,237,0.35)]">
        <h2 className="font-display text-2xl font-bold text-center">Login</h2>
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
          autoComplete="current-password"
        />
        <Button
          className="w-full"
          disabled={!email || !password || loginLoading}
          onClick={async () => {
            setLoginLoading(true);
            const result = await signInWithEmail(email, password);
            setLoginLoading(false);
            // If login is successful, go to dashboard
            if (!result || !result.error) {
              navigate("/dashboard");
            }
          }}
        >
          {loginLoading ? "Logging in..." : "Login"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>Back to Home</Button>
      </Card>
    </div>
  );
}
