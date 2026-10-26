import { supabase } from "./supabase";

const API_URL = (import.meta.env.VITE_DYSCOVER_API_URL || "").replace(/\/$/, "");

async function callPythonApi(path, body) {
  if (!API_URL) {
    throw new Error("The Python learning API is not configured. Set VITE_DYSCOVER_API_URL to your Dyscover backend URL.");
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in first.");
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "The Dyscover learning service could not complete this request.");
  return data;
}

export async function invokeLearningFunction(body) {
  return callPythonApi("/api/learning", body);
}

export async function getSignedInUser() {
  // getUser() rejects with "Auth session missing!" for guest play. A missing
  // session is an expected state in this app, so inspect the local session.
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
}

export async function startPlacementDiagnostic(gradeTier) {
  return callPythonApi("/api/placement", { action: "start", grade_tier: gradeTier });
}

export async function answerPlacementDiagnostic(history) {
  return callPythonApi("/api/placement", { action: "answer", history });
}

