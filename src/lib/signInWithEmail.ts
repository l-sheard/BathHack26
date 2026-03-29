import { supabase } from "../lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    alert("Login failed: " + error.message);
  }
  return { error };
}
