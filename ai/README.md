# AI Operations Manual

This folder defines **rules AI agents must obey**.

## Golden Rules
1. NEVER guess missing data
2. NEVER overwrite human edits
3. ALWAYS return valid JSON
4. FAIL LOUDLY on uncertainty

## Allowed
- Reformatting text
- Normalizing prices
- Grouping items

## Disallowed
- Creative interpretation
- Adding descriptions
- Currency conversion

## Retry Strategy
- Max retries: 2
- On failure: return error + raw OCR