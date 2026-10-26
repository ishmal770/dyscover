# Dyscover Python backend

This repository is the FastAPI backend for Dyscover. Student identity is read from the Supabase access token sent by the UI. The service validates that token with Supabase Auth and uses its server-only service-role key for database work. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it.

## Run locally

Install the packages in `requirements.txt`, then set `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in a local `.env` file. `CORS_ORIGINS` is a comma-separated list of allowed frontend origins; the local Vite origins are the default.

Start the API with `uvicorn app.main:app --reload`. Check `/health`; interactive API documentation is at `/docs`.

## Learning endpoints

- `POST /api/placement` with `action: start` or `action: answer`: server-scored, six-skill placement baseline.
- `POST /api/learning` with `action: daily_plan`, `record_session`, or `student_dashboard`: IRT skill updates, daily plans, and recommendations.
- `POST /api/learning` with `action: expert_dashboard` or `expert_feedback`: assigned-student reporting and expert focus overrides.

All learning endpoints require `Authorization: Bearer <Supabase access token>`.

## Deploy on Render

Create a Render Web Service from the `dyscover-backend` folder using `render.yaml`. Add the Supabase URL, publishable/anon key, service-role key, and the deployed frontend origin to the service environment. Set the UI's `VITE_DYSCOVER_API_URL` to the Render service URL, then redeploy the UI.

To enable an expert account, both accounts must sign in once. Run the SQL in the UI repo's `supabase/EXPERT_ACCESS.sql.example` after replacing the two email placeholders.
