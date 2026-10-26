# Dyscover adaptive backend

The project already has the schema and row-level security scripts in Supabase. This implementation adds two authenticated Edge Functions:

- placement-diagnostic: serves one server-scored item for each of the six reading skills, adapts the next item's difficulty, records response speed and accuracy, seeds skill levels, and creates the first 15-minute World 1 plan.
- adaptive-session: records completed games, updates IRT skill ratings, flags repeated low results for review, builds rotating 15-minute daily plans, selects content with 80/20 exploitation/exploration, advances World 1 only after every skill reaches the target and recent practice is at least 75%, and serves expert dashboard data and feedback overrides.

## Deploy

From the Dyscover UI folder:

```powershell
npx supabase db push
npx supabase functions deploy adaptive-session
npx supabase functions deploy placement-diagnostic
```

The migration removes direct client SELECT access to diagnostic question payloads; the functions use the server-side Supabase admin client after authenticating the signed-in user.

## Give an expert access

Create both accounts and have both sign in once. In the Supabase SQL Editor, copy the content of EXPERT_ACCESS.sql.example, replace the two email placeholders, and run it. The app intentionally does not let users promote themselves to expert or choose arbitrary student accounts.

The dashboard reads only rows assigned in expert_students. Expert notes can set a seven-day skill focus; the next generated daily plan prioritizes that skill.

