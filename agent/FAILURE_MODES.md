# FAILURE_MODES.md — What to Do When Things Break

## OCR returns garbage
- Save raw image references + OCR output
- Try alternate OCR settings or provider
- Return a draft with `parse_status="needs_review"`

## LLM returns non-JSON
- Retry once with “JSON ONLY” reminder
- Retry twice with smaller chunking (by category/page)
- If still failing: return error + raw OCR to UI

## Schema mismatch
- Do not “guess” fixes
- Only correct structure / formatting
- Never invent values to satisfy schema

## Slow response
- Add timing metrics
- Consider async OCR/parse with job status endpoint (only if required)
