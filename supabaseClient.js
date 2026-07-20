// ============================================================
// SALONA — SHARED SUPABASE CLIENT
// Keep this file in the same folder as login.html and the
// dashboard .html files, and load it AFTER the Supabase CDN
// script on every page that needs database/auth access:
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="supabaseClient.js"></script>
//
// The anon/public key below is SAFE to expose in frontend code —
// it only allows what your Row Level Security policies permit.
// ============================================================

const SUPABASE_URL = "https://wfmlkgtfnohxcbqoqdla.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbWxrZ3Rmbm9oeGNicW9xZGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMTMzMzQsImV4cCI6MjA5OTY4OTMzNH0.5Tp_qO9feXTHa3DK_42DyuwdE_hPoYUNRHajdMHswuQ";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// Helper: get the logged-in user's role from public.users.
// Returns null if nobody is logged in.
// ------------------------------------------------------------
async function getCurrentUserProfile() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb
    .from("users")
    .select("id, full_name, email, role, status, salary, dark_mode, notify_email, notify_sms")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("Could not load user profile:", error.message);
    return null;
  }
  return data;
}

// ------------------------------------------------------------
// Helper: guard a dashboard page — redirects to login.html if
// nobody is logged in, or if their role doesn't match.
// Call at the top of each dashboard's script:
//   const profile = await requireRole('manager');
// ------------------------------------------------------------
async function requireRole(expectedRole) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    window.location.href = "login.html";
    return null;
  }
  if (profile.status && profile.status !== "active") {
    alert("This account has been deactivated. Contact your manager for access.");
    await sb.auth.signOut();
    window.location.href = "login.html";
    return null;
  }
  if (profile.role !== expectedRole) {
    alert(`This page is for ${expectedRole}s only. You're logged in as ${profile.role}.`);
    window.location.href = "login.html";
    return null;
  }
  return profile;
}
