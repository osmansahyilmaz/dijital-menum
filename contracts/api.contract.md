# API Contract (MVP)

## Auth
- Supabase Auth on frontend
- Backend verifies JWT on protected endpoints

## Endpoints
POST /api/menus
- multipart images
- returns: { menu_id, data }

GET /api/menus/{menu_id}
- owner-only
- returns: menu JSON

PUT /api/menus/{menu_id}
- owner-only
- body: menu JSON
- returns: ok

POST /api/menus/{menu_id}/publish
- owner-only
- returns: { public_url }

GET /api/public/menus/{menu_id}
- public
- only if is_published=true
