# Dijital Menum — MVP Work Packages (2 Devs, Phase-Based)

> This file is the **single source of truth** for MVP execution.
> No frontend-only / backend-only silos.
> Tasks are parallel by design and safe for AI-agent assistance.

---

## PHASE 0 — Foundation & Antigravity Guardrails

### Goals

* Repo is safe for humans + AI agents
* Scope, rules, and contracts are unambiguous

### Tasks

**Osman**

* [T] Initialize monorepo structure
* [T] Place `/agent`, `/contracts`, `/security`, `/quality` at repo root
* [T] Add PR template with AI compliance checklist

**Emirhan**

* [T] Review `/agent` rules for conflicts or ambiguity
* [T] Validate schema + API contracts alignment
* [T] Add root `README.md`, `SPECS.md`, `.env.example`

### Notes

* No feature work starts before this phase is complete
* `/agent/README.md` must be readable and conflict-free

---

## PHASE 1 — Tooling, Environment & Baselines

### Goals

* Project runs locally for both devs
* Clean baseline for frontend + backend

### Tasks

**Osman**

* [ ] FastAPI scaffold (config, logging, health endpoint)
* [ ] Env loading + validation on backend
* [ ] CORS configuration

**Emirhan**

* [ ] Frontend scaffold (Vite + React + Tailwind)
* [ ] API client abstraction on frontend
* [ ] Global error handling conventions

---

## PHASE 2 — Authentication & Ownership

### Goals

* Secure identity
* Enforce menu ownership everywhere

### Tasks

**Osman**

* [T] Backend JWT verification dependency
* [T] Owner-check middleware for menus
* [T] Backend auth error handling

**Emirhan**

* [T] Supabase project setup
* [T] Frontend login/register UI
* [T] Session persistence + logout
* [T] Route protection on frontend

---

## PHASE 3 — Database & Contracts Lock-in

### Goals

* Stable data model
* Prevent schema drift

### Tasks

**Osman**

* [ ] Create `menus` table (JSONB, user_id, is_published)
* [ ] Optional `menu_images` table
* [ ] Ownership enforcement (RLS or backend)

**Emirhan**

* [ ] Finalize `contracts/menu.schema.json`
* [ ] Validate schema with real examples
* [ ] Lock schema version (v1)

---

## PHASE 4 — Image Upload & Storage

### Goals

* Safe, reliable image uploads

### Tasks

**Osman**

* [ ] Multipart upload endpoint (FastAPI)
* [ ] File validation (type, size limits)
* [ ] Upload images to Supabase Storage

**Emirhan**

* [ ] Frontend file picker (multi-image)
* [ ] Upload progress + error states
* [ ] Store image references in UI state

---

## PHASE 5 — OCR Pipeline (Google Vision)

### Goals

* Images → clean, normalized text

### Tasks

**Osman**

* [ ] Google Vision OCR integration
* [ ] OCR duration logging
* [ ] Persist raw OCR text + metadata

**Emirhan**

* [ ] OCR text normalization (whitespace, page separators)
* [ ] OCR error handling & UI feedback
* [ ] Optional: Tesseract fallback (same output format)

---

## PHASE 6 — LLM Parsing & Validation

### Goals

* OCR text → strict, valid JSON
* Zero hallucination

### Tasks

**Osman**

* [ ] Strict JSON-only prompt templates
* [ ] Retry logic (max 2 attempts)
* [ ] Prompt-injection resistance

**Emirhan**

* [ ] JSON parse validation
* [ ] Schema validation
* [ ] Error objects returned to frontend
* [ ] Flag missing prices or fields (no guessing)

---

## PHASE 7 — Draft Menu Lifecycle

### Goals

* Editable drafts
* No accidental publishing

### Tasks

**Osman**

* [ ] Create menu draft on upload
* [ ] GET draft menu endpoint
* [ ] PUT update menu endpoint
* [ ] Block publish mutation in update

**Emirhan**

* [ ] Menu editor UI (categories/items)
* [ ] Add/remove/edit items
* [ ] Save draft UX + feedback

---

## PHASE 8 — Theme & Presentation

### Goals

* Controlled customization

### Tasks

**Osman**

* [ ] Define allowed theme fields
* [ ] Validate theme values on backend

**Emirhan**

* [ ] Theme picker UI
* [ ] Persist theme in menu JSON
* [ ] Apply theme on preview/public views

---

## PHASE 9 — Publish & Public Access

### Goals

* Explicit human-controlled publishing

### Tasks

**Osman**

* [ ] Publish endpoint (POST only)
* [ ] Set `is_published=true`
* [ ] Public read-only menu endpoint
* [ ] Enforce published-only access

**Emirhan**

* [ ] Public menu page UI
* [ ] QR code generation (frontend)
* [ ] QR download option

---

## PHASE 10 — QA, Hardening & Acceptance

### Goals

* MVP works end-to-end
* Failure cases handled

### Tasks

**Osman**

* [ ] Backend testing (happy + failure paths)
* [ ] File size & rate limits
* [ ] Improve backend error messages

**Emirhan**

* [ ] Frontend happy-path testing
* [ ] Auth edge-case testing
* [ ] Mobile responsiveness check

---

## PHASE 11 — Documentation & Handoff

### Goals

* Safe continuation by humans or AI agents

### Tasks

**Osman**

* [ ] Backend docs + deployment notes
* [ ] Security review (no leaked secrets)

**Emirhan**

* [ ] Frontend docs + user flow explanation
* [ ] Verify `/agent` rules match actual behavior
* [ ] Final contract & schema review

---

## Non-Negotiables (Reminder)

* ❌ No hallucinated menu data
* ❌ No auto-publishing
* ❌ No silent schema changes
* ✅ Human-in-the-loop always
* ✅ `/agent` rules override task pressure
