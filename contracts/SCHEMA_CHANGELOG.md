# Menu Schema Changelog

This document tracks all versions of the menu schema. Each version is **immutable** after release.

## Version Policy

- **DO NOT MODIFY** released schema versions
- Create a new version (v2, v3, etc.) for any changes
- Include migration notes when creating new versions
- Backend must support reading all released versions

---

## v1 (Current - 2026-01-17)

**File:** `menu.schema.v1.json`

**Status:** 🔒 LOCKED - Do not modify

### Structure
```json
{
  "schema_version": 1,
  "title": "string (optional)",
  "categories": [
    {
      "name": "string (required)",
      "items": [
        {
          "name": "string (required)",
          "description": "string (optional)",
          "price": "number | string | null (optional)"
        }
      ]
    }
  ],
  "theme": {
    "primaryColor": "string (optional)",
    "backgroundColor": "string (optional)",
    "font": "string (optional)"
  }
}
```

### Required Fields
- `schema_version`: Must be `1`
- `categories`: Array of category objects
- `categories[].name`: Category name (min 1 char)
- `categories[].items`: Array of menu items
- `categories[].items[].name`: Item name (min 1 char)

### Optional Fields
- `title`: Menu title
- `categories[].items[].description`: Item description
- `categories[].items[].price`: Item price (can be null if missing from OCR)
- `theme`: Theme customization object

### Notes
- `additionalProperties: false` on all objects prevents unknown fields
- Price can be number, string, or null to handle OCR edge cases
- No hallucination rule: missing prices must be null, not guessed

---

## Future Versions

When creating v2:
1. Create `menu.schema.v2.json`
2. Update `menu.schema.json` to reference v2
3. Add migration notes to this changelog
4. Ensure backend can read both v1 and v2
