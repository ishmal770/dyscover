import { supabase } from "./supabase";

export async function invokeLearningFunction(body) {
  const { data, error } = await supabase.functions.invoke("adaptive-session", { body });
  if (error) {
    let message = error.message || "The learning service could not be reached.";
    try {
      const details = await error.context?.json();
      if (details?.error) message = details.error;
    } catch {
      // The response may not contain JSON.
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getSignedInUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function startPlacementDiagnostic(gradeTier) {
  const { data, error } = await supabase.functions.invoke("placement-diagnostic", {
    body: { action: "start", grade_tier: gradeTier },
  });
  if (error) throw new Error(error.message || "Could not start the diagnostic.");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function answerPlacementDiagnostic(history) {
  const { data, error } = await supabase.functions.invoke("placement-diagnostic", {
    body: { action: "answer", history },
  });
  if (error) throw new Error(error.message || "Could not save this answer.");
  if (data?.error) throw new Error(data.error);
  return data;
}

