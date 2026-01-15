# SPECS — QR Code Menu MVP (Agent-Focused)

## Primary user journeys
1) Owner signs up / logs in (Supabase Auth)
2) Owner uploads menu images
3) System OCRs + parses to JSON
4) Owner edits JSON (name/desc/price/category/theme)
5) Owner publishes and receives QR code
6) Customer scans QR and views public menu

## Architecture (monorepo recommended)
- /frontend (React + Vite + Tailwind)
- /backend (FastAPI)
- Supabase: Postgres (JSONB), Auth, Storage

## OCR
### Google Vision (default)
- Use Google Cloud Vision OCR as primary OCR provider.
- Persist:
  - raw Vision response (optional, redacted)
  - normalized OCR text output
  - per-page text fragments

### Tesseract (fallback)
- Use only if Vision is unavailable locally.
- Must produce the same normalized OCR text format.

## LLM parsing
- Must output JSON only.
- Must follow schema exactly.
- If uncertain: return error + raw OCR + best-effort partial JSON (flagged).

## Publishing rules
- Draft menus are private
- Public endpoint returns data only if published=true
- QR code is generated only for published menus

## Data model
- menus.data is JSONB
- menus.is_published boolean
- menus.user_id owner id
