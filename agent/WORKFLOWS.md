# WORKFLOWS.md — Agent Execution Loops

## A) Feature implementation loop (Full stack)
1) Read `/contracts/*` for API + schema
2) Locate relevant code paths
3) Add/adjust tests first (where practical)
4) Implement smallest possible change
5) Run: lint + typecheck + unit tests
6) Update docs/contracts if needed

## B) Bug triage loop
1) Reproduce or describe reproduction steps
2) Identify failing layer: FE / BE / OCR / LLM / DB
3) Add a failing test (or a reproducible script)
4) Fix with minimal diff
5) Prevent regression

## C) OCR → LLM parsing loop
1) OCR (Google Vision preferred)
2) Normalize text (consistent whitespace, page separators)
3) Prompt LLM with strict JSON schema + example
4) Validate JSON
5) Store:
   - raw OCR text
   - parsed JSON
   - validation status + flags
6) Return JSON to editor for human review
