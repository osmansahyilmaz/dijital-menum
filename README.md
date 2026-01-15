# Dijital Menum — AI‑Agent Operating Repo (MVP)

This repo is **not** “AI future plans”. It is a **hard‑rules operating system** for an AI agent working on:
- QR code menu MVP (React/Vite/Tailwind + FastAPI + Supabase)
- OCR → Parse → Edit → Publish flow
- Safe, reviewable, repeatable engineering work

If you are an AI agent: **read `/agent/` first and obey it.**

## MVP scope (from plan)
- Upload menu images
- OCR → text
- LLM parses into structured JSON
- Human edits in dashboard
- Publish + public menu + QR code

## OCR choice (OK for this MVP)
- Preferred: **Google Cloud Vision OCR**
- Optional: Tesseract (fallback / local dev)

## Where the rules live
- `/agent/` — *non‑negotiable rules, workflows, checklists, prompts*
- `/contracts/` — API + JSON schema contracts
- `/quality/` — QA, tests, acceptance, observability
- `/security/` — secrets, auth, injection defenses
- `/templates/` — PR template, issue templates, changelog rules

## Quick start (dev)
See `/contracts/ENVIRONMENT.md` for env vars.

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Non‑negotiables (summary)
- Never fabricate menu items or prices
- Never auto‑publish
- Always validate JSON against schema
- Always preserve raw OCR text for debugging
