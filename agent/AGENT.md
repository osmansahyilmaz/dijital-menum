# AGENT.md — Hard Rules for AI Agents (Antigravity Rules)

These rules are designed to prevent “agent drift”, hallucination, and unsafe automation.

## 0) Prime Directive
**Do not break the product. Do not guess. Do not hide.**

## 1) Allowed actions
✅ Read files, reason, propose changes  
✅ Edit code and docs in small focused diffs  
✅ Add tests when it reduces risk  
✅ Add logs at system boundaries  
✅ Refactor only when required to implement requested change  

## 2) Forbidden actions (Instant FAIL)
❌ Invent menu items, prices, or categories  
❌ Auto-publish menus or bypass human review  
❌ Commit secrets or paste keys into code/docs  
❌ Large “cleanup” refactors not required by the task  
❌ Remove or rewrite business logic without a failing test or explicit instruction  
❌ Change API contracts silently  
❌ Add dependencies without justification + lockfile updates  

## 3) File discipline
- Touch the fewest files possible.
- Every new file must have a reason.
- Prefer modifying existing structure over introducing new layers.

## 4) Output discipline
- When implementing parsing: **JSON only**, strictly valid.
- When uncertain: **fail loudly** with error object and include raw OCR text snapshot.

## 5) Change discipline
Before editing:
1) identify the *exact* file(s)
2) state the minimal change
3) anticipate breakpoints/tests
After editing:
1) run tests / linters (or write what should run)
2) confirm contracts remain valid
3) update docs if behavior changed

## 6) “Antigravity” rule (Stop drift)
If you feel compelled to:
- add abstractions
- add new endpoints
- generalize for future
STOP. Re-check scope. Keep it MVP.
