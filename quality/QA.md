# QA — Acceptance & Regression

## MVP Acceptance
- Upload 1 image → menu appears in editor
- Upload multi-page → categories preserved in order
- Edit and save draft persists on refresh
- Publish enables public endpoint + QR code
- Unpublished menu not accessible publicly

## Regression set (run before deploy)
- Backend unit tests
- Frontend build
- Schema validation tests
- Security lint: no secrets, no service role in frontend
