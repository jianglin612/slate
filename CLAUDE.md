# Slate Project Notes

## Supabase Configuration

**IMPORTANT:** This project uses the new Supabase key naming convention:
- `SUPABASE_PUBLISHABLE_KEY` - The public/anon key (safe for client-side, starts with `sb_publishable_`)
- `SUPABASE_SECRET_KEY` - The service_role key (server-side only, starts with `sb_secret_`)

Do NOT use the deprecated naming:
- ~~SUPABASE_ANON_KEY~~ (deprecated)
- ~~SUPABASE_SERVICE_KEY~~ (deprecated)

The new key format uses `sb_publishable_` and `sb_secret_` prefixes (not the old JWT format).

Get these from: Supabase Dashboard > Project Settings > API > Project API keys

## Tech Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Python + FastAPI
- Database: Supabase PostgreSQL
- Auth: Google/Microsoft OAuth (backend handles token exchange)
- AI: Claude API for task extraction

## Development URLs
- Frontend: http://localhost:5173 (or 5174 if 5173 is in use)
- Backend: http://localhost:8000
