-- Diagnostic answer keys are read only by authenticated Edge Functions.
-- The client games use local presentation data; the service role is used by the
-- authenticated functions after deriving the student ID from the verified JWT.
drop policy if exists "questions_select_authenticated" on public.diagnostic_questions;
revoke select on table public.diagnostic_questions from anon, authenticated;
grant select on table public.diagnostic_questions to service_role;

