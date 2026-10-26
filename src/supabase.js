import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PROFILE_REDIRECT_KEY = "dyscover-auth-redirect";

export async function signInWithGoogle() {
  sessionStorage.setItem(PROFILE_REDIRECT_KEY, "profile");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    sessionStorage.removeItem(PROFILE_REDIRECT_KEY);
    throw error;
  }
}

// Only send the child to their profile after a Google sign-in, not on every
// normal page load when a saved session already exists.
export function consumeProfileRedirect() {
  const shouldRedirect = sessionStorage.getItem(PROFILE_REDIRECT_KEY) === "profile";
  if (shouldRedirect) sessionStorage.removeItem(PROFILE_REDIRECT_KEY);
  return shouldRedirect;
}

export function getGoogleProfile(user) {
  const meta = user?.user_metadata ?? {};
  const fullName = meta.full_name || meta.name || "";
  const firstName = meta.given_name || fullName.trim().split(/\s+/)[0] || "";
  return {
    name: (firstName || user?.email?.split("@")[0] || "").slice(0, 16),
    email: user?.email || "",
  };
}