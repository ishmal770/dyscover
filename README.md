# Dyscover

The frontend connects to the Python FastAPI service in `backend/` (the local working copy is also in the sibling `dyscover-backend` folder). Supabase remains the authentication and database provider; the backend validates the user's Supabase access token and keeps the service-role key server-side.

To deploy the Python API on Render from this repository, use the root `render.yaml` Blueprint. Add the Supabase environment values and the production frontend URL to the service. Set the frontend hosting variable `VITE_DYSCOVER_API_URL` to the Render service's HTTPS URL, then redeploy the frontend. See `backend/README.md` for endpoint and local development details.
