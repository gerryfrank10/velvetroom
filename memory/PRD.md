# DurexEthiopia - Classified Listings Platform

## Original Problem Statement
Build a classified listings platform for adult services, similar to Vivastreet, under the brand "DurexEthiopia" (and other country-specific variants).

## Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI, Pydantic
- **Database:** MongoDB
- **Authentication:** JWT (OAuth planned)

## Core Requirements

### User Features
- [x] User registration (email/password)
- [x] User login with JWT authentication
- [ ] Google OAuth login (planned)
- [ ] Facebook OAuth login (planned)
- [x] Anonymous browsing of listings
- [x] Full CRUD for user-owned listings
- [x] Listings include: title, description, images/videos, services, pricing tiers, age, race, gender
- [x] Hierarchical location system

### UI/UX Features
- [x] "Exotic" adult-themed navigation menu with categories
- [x] Categories: All Escorts, Female, Male, Trans, LGBT, Massage, Swingers, BDSM, Meet & Fuck, VIP
- [x] Listings displayed in grid (4 columns on desktop)
- [x] Pagination with page controls
- [x] Quick-view modal for listings with contact info, services, pricing
- [x] "View Full Profile" link in modal
- [x] Dark/Light mode theme switcher
- [x] Language switcher (English/French)
- [x] Advanced filters: Category, Gender, Ethnicity, Location, Age range

### Admin Dashboard
- [x] View all users and listings
- [x] Approve, edit, or reject listings
- [x] User management: Suspend, Activate, Set Pending, Grant VIP
- [x] Edit any listing field (title, description, age, race, gender, status, featured)
- [x] Delete users and their data

### Technical Features
- [x] Automatic watermarking on uploaded images/videos
- [x] Country-configurable via .env (APP_NAME, AGE_VERIFY, etc.)
- [x] Pagination API with count endpoint
- [ ] Age verification modal based on AGE_VERIFY env

## What's Been Implemented (Dec 2024)

### Backend
- JWT-based authentication
- Listing CRUD with age, race, gender fields
- Pagination: `GET /api/listings?page=1&limit=20`
- Count endpoint: `GET /api/listings/count`
- Admin listing edit: `PUT /api/admin/listings/{id}/edit`
- Admin user status: `PUT /api/admin/users/{id}/status`
- Admin VIP toggle: `POST /api/admin/users/{id}/vip`
- Image/video watermarking with FFmpeg

### Frontend
- Exotic navigation menu with dropdown subcategories
- Home page with hero, search, filters, pagination
- Filter by Category, Gender, Ethnicity, Location, Age range
- Category routing: `/category/female`, `/category/male`, etc.
- Post Listing form with Age, Gender, Race fields
- Admin Dashboard with Users tab and listing edit modal
- Listing Modal with View Full Profile link
- Theme switching (dark/light)
- Language selector

## Test Credentials
- User: TEST_user@test.com / test123
- Admin: TEST_admin@test.com / admin123

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get listings with filters & pagination
- `GET /api/listings/count` - Get total count for pagination
- `GET /api/listings/{id}` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/{id}` - Update listing (owner/admin)
- `DELETE /api/listings/{id}` - Delete listing

### Admin
- `GET /api/admin/listings` - Get listings by status
- `POST /api/admin/listings/{id}/status` - Update listing status
- `PUT /api/admin/listings/{id}/edit` - Edit any listing field
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/status` - Change user status
- `DELETE /api/admin/users/{id}` - Delete user

## Upcoming Tasks (P1)
1. **Google OAuth Integration** - Social login with Google
2. **Facebook OAuth Integration** - Social login with Facebook
3. **Video Marketplace** - UI for uploading/purchasing videos
4. **Age Verification Flow** - Blur images based on AGE_VERIFY env

## Future Tasks (P2)
1. **Expand Location Database** - Better location data source
2. **User Pending Status Logic** - Restrict functionality for pending users
3. **Refactor server.py** - Split into modular routers

## File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI app with all routes
│   ├── requirements.txt   # Python dependencies
│   ├── .env              # Environment config
│   └── locations.json    # Location hierarchy data
├── frontend/
│   ├── src/
│   │   ├── App.js        # Router and providers
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   └── context/      # Auth, Theme contexts
│   ├── package.json
│   └── .env
└── test_reports/         # Test results
```
