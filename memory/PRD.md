# ReviewGen - AI-Powered Review Suggestions Platform

## Original Problem Statement
Build a landing page that displays AI-generated review suggestions based on client business details. Clients have subroutes where their customers land, view business info and services, copy a suggested review, then click "Next" to navigate to the client's GMB page and paste the review.

## Architecture
- **Frontend**: React with Tailwind CSS, Framer Motion, Sonner toasts
- **Backend**: FastAPI with Claude AI integration (Anthropic API)
- **Database**: MongoDB for client data storage

## User Flow
1. Customer lands on `/{client-slug}` (e.g., `/british-english-academy`)
2. Page displays business name, services, and AI-generated review suggestions
3. Customer clicks a review card → review copied to clipboard + toast notification
4. Customer clicks "Post Review" → opens GMB link in new tab
5. Customer pastes (Ctrl+V) the review into GMB comment box

## What's Implemented (March 17, 2026)
- [x] Dynamic client subroutes (/:clientSlug)
- [x] Client-specific branding (colors, hero images)
- [x] Claude AI review generation (max 10 reviews)
- [x] Review count slider (1-10)
- [x] Copy to clipboard functionality
- [x] "Post Review" action bar with GMB redirect
- [x] Toast notifications
- [x] Skeleton loading states
- [x] Two seeded clients: British English Academy, Uniconnect Immigration

## Seeded Clients
1. **British English Academy** - `/british-english-academy` - GMB: https://share.google/iHIyjhCOab53qVTfv
2. **Uniconnect Immigration** - `/uniconnect-immigration` - GMB: https://share.google/zkTdVH1k8mYibButO

## API Endpoints
- `GET /api/clients` - List all clients
- `GET /api/clients/{slug}` - Get client by slug
- `POST /api/generate-reviews` - Generate reviews via Claude
- `POST /api/seed-clients` - Seed initial clients

## Backlog
- P1: Admin panel to add/edit clients
- P2: Review analytics tracking
- P2: Custom review templates per client
- P3: Multi-language support
