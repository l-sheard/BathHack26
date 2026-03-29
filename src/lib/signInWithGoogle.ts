import { supabase } from "../lib/supabase";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) {
    alert("Google sign-in failed: " + error.message);
  }
}
