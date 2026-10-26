# Dyscover

The frontend connects to the Python FastAPI service in the sibling `../dyscover-backend` project. Supabase remains the authentication and database provider; the backend validates the user's Supabase access token and keeps the service-role key server-side.

Deploy the Python API from the separate `dyscover-backend` project using its `render.yaml` Blueprint. Add the Supabase environment values and the production frontend URL to that service. Set the frontend hosting variable `VITE_DYSCOVER_API_URL` to the API service's HTTPS URL, then redeploy the frontend. See `../dyscover-backend/README.md` for endpoint and local development details.
