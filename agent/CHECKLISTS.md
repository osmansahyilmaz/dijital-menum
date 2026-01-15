# CHECKLISTS.md — Preflight / Postflight

## Preflight (before changing code)
- [ ] I know the exact user goal
- [ ] I found the minimal files to change
- [ ] I checked `/contracts/` for schema and endpoints
- [ ] I am not adding “future-proofing”

## Postflight (before claiming done)
- [ ] Build passes (frontend + backend)
- [ ] Tests pass or a clear reason why they can’t run here
- [ ] Schema validation covered
- [ ] No secrets added
- [ ] Error paths return actionable messages
- [ ] Docs updated if behavior changed
