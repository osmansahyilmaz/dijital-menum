# Environment Variables

## Backend (required)
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only; never expose to frontend)

## OCR (Google Vision)
- GOOGLE_APPLICATION_CREDENTIALS (path to service account json)
Optional:
- GOOGLE_CLOUD_PROJECT

## Frontend (public)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_BASE_URL
