# RoomieFit — Product Requirements Document

**Version:** 1.0
**Stack:** Next.js (JavaScript, App Router), MongoDB (native `mongodb` driver, no Mongoose), Better Auth (Email/Password + Google OAuth), shadcn/ui

---

## 1. Problem Statement

Students moving to a new city for college or internships struggle to find roommates who are actually compatible with their lifestyle and trustworthy enough to live with. On the other side, students or PG/flat owners with an available spot waste time posting in scattered WhatsApp groups and Facebook pages, receiving low quality, low intent responses. There is no structured way to showcase lifestyle preferences (sleep schedule, cleanliness, food habits, guests, budget) and no intelligent system to surface genuinely compatible matches from a pool of strangers. The result is mismatched living situations, avoidable conflict, and wasted time on both sides of the search.

## 2. Goals & Success Metrics

Primary goal for the MVP: prove that structured lifestyle profiles plus a simple compatibility score produce better, faster roommate connections than unstructured group chats.

| Metric | Target for MVP validation |
|---|---|
| Profile completion rate | > 60% of signed-up users complete their lifestyle profile |
| Listings posted | At least 50 live listings in the pilot city/campus within 4 weeks |
| Match engagement | > 30% of users view at least 3 recommended matches |
| Contact conversion | > 15% of users initiate contact with a matched user or listing |
| Retention | > 25% of users return within 7 days of first visit |

## 3. Target Users

- **Persona A — The Seeker.** A student or intern relocating to a new city who needs a room/flat and a compatible roommate. Wants to filter by budget, location, and lifestyle fit before reaching out.
- **Persona B — The Host/Lister.** A student, tenant, or PG/flat owner with an available spot. Wants qualified, serious responses instead of dozens of low intent messages in a group chat.

## 4. MVP Feature Scope

### 4.1 Authentication
- Sign up / log in with Email + Password
- Sign up / log in with Google (OAuth)
- Session managed via Better Auth; protected routes for dashboard, profile, listings

### 4.2 Lifestyle Profile
Every user fills a structured preference profile used both for display on their card and as input to the compatibility score.
- Basic info: name, age, gender, current city, target city, college/company (optional)
- Sleep schedule: early bird / night owl / flexible
- Cleanliness level: very tidy / moderate / relaxed (1-5 scale)
- Food preference: vegetarian / non-vegetarian / vegan / no preference
- Smoking & drinking habits: yes / no / occasionally
- Guests & socializing: rarely / sometimes / often
- Noise tolerance / study-focus needs: quiet space / okay with noise
- Budget range (monthly rent)
- Move-in timeline
- Short free-text bio (max 300 characters)

### 4.3 Listings (PG / Flat / Spare Room)
- Create a listing: title, city/locality, rent, deposit, room type (single/shared), amenities, available-from date, photos (URL input for MVP), description
- Listing owner's lifestyle profile is shown alongside the listing so seekers can judge fit
- Edit / mark listing as filled / delete listing
- Browse listings with filters: city, budget range, room type, move-in date

### 4.4 Compatibility Matching
A rule-based scoring engine (no ML needed for MVP) compares two lifestyle profiles attribute by attribute and produces a 0-100 compatibility score, shown as a badge on listings and on a dedicated "Find Roommates" page that ranks other seekers by compatibility to the current user.
- Weighted scoring across: sleep schedule, cleanliness, food, smoking/drinking, guests/social, noise tolerance, budget overlap, city match
- Score bucket shown to user: Great Match (80-100), Good Match (60-79), Fair Match (40-59), Low Match (<40)
- "Find Roommates" page lists other seeker profiles in the same target city, sorted by score

### 4.5 Discovery & Contact
- Search/filter listings and roommate profiles
- View a full profile or listing detail page
- "Express Interest" action that reveals contact info (email, and optional phone) — keeps it simple for MVP instead of building in-app chat
- Basic dashboard: my profile, my listings, users who expressed interest

### 4.6 Out of Scope for MVP (Future Roadmap)
- In-app real-time chat / messaging
- ID / government document verification and background checks
- Payments, rent tracking, or deposit escrow
- Reviews & ratings history between past roommates
- Mobile app (MVP is responsive web only)
- ML-based matching (MVP uses transparent rule-based scoring)

## 5. Core User Flows

- **Flow 1 — Onboarding.** User signs up (Google or email/password) → redirected to profile setup wizard → fills lifestyle preferences → lands on dashboard.
- **Flow 2 — Seeker finds a roommate.** Dashboard → "Find Roommates" or "Browse Listings" → apply filters → view ranked results with compatibility badges → open a profile/listing → Express Interest → contact details revealed.
- **Flow 3 — Host posts a listing.** Dashboard → "Post a Listing" → fill listing form (profile lifestyle data is auto-attached) → listing goes live → host sees list of interested seekers in dashboard, ranked by compatibility.

## 6. Data Model (MongoDB Collections)

### 6.1 `users` (managed primarily by Better Auth, extended with app fields)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | From Better Auth |
| `email` | String | Unique, from Better Auth |
| `image` | String | Optional avatar URL |
| `emailVerified` | Boolean | Better Auth managed |
| `createdAt` / `updatedAt` | Date | Timestamps |

### 6.2 `profiles`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | Reference to `users._id` |
| `age` | Number | |
| `gender` | String | male / female / other |
| `currentCity` | String | |
| `targetCity` | String | City the user is moving to / searching in |
| `sleepSchedule` | String | early_bird / night_owl / flexible |
| `cleanliness` | Number | 1-5 scale |
| `foodPreference` | String | veg / non_veg / vegan / no_preference |
| `smoking` | String | yes / no / occasionally |
| `drinking` | String | yes / no / occasionally |
| `socializing` | String | rarely / sometimes / often |
| `noiseTolerance` | String | quiet / moderate / dont_mind |
| `budgetMin` / `budgetMax` | Number | Monthly rent range |
| `moveInDate` | Date | |
| `bio` | String | Max 300 chars |
| `profileComplete` | Boolean | Gate for showing in match results |
| `createdAt` / `updatedAt` | Date | Timestamps |

### 6.3 `listings`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `ownerId` | ObjectId | Reference to `users._id` |
| `title` | String | |
| `city` / `locality` | String | |
| `roomType` | String | single / shared |
| `rent` | Number | Monthly rent |
| `deposit` | Number | |
| `amenities` | Array<String> | wifi, ac, furnished, etc. |
| `photos` | Array<String> | Image URLs, MVP: direct URL input |
| `description` | String | |
| `availableFrom` | Date | |
| `status` | String | active / filled / closed |
| `createdAt` / `updatedAt` | Date | Timestamps |

### 6.4 `interests` (Express Interest records)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `fromUserId` | ObjectId | User expressing interest |
| `toUserId` | ObjectId | Profile owner or listing owner |
| `listingId` | ObjectId | Optional, null if interest is in a person, not a listing |
| `compatibilityScore` | Number | Score at time of interest, 0-100 |
| `createdAt` | Date | |

## 7. Compatibility Scoring Logic

Rule-based weighted comparison, computed server-side on demand (not stored per pair, to keep MVP simple). Weights sum to 100.

| Attribute | Weight | Scoring rule |
|---|---|---|
| City match (target city) | 15 | Exact match = full points, else 0 |
| Budget overlap | 15 | Overlapping range = full points, partial overlap scaled, no overlap = 0 |
| Sleep schedule | 15 | Exact match = full, flexible on either side = partial, opposite = 0 |
| Cleanliness (1-5) | 15 | Full points if difference is 0-1, scaled down as gap increases |
| Food preference | 10 | Exact match = full, compatible combos (e.g. veg + no_preference) = partial |
| Smoking/drinking | 10 | Exact match = full, one occasional = partial, hard mismatch = 0 |
| Socializing/guests | 10 | Exact match = full, adjacent levels = partial |
| Noise tolerance | 10 | Exact match = full, adjacent = partial, opposite = 0 |

Final score buckets: 80-100 Great Match, 60-79 Good Match, 40-59 Fair Match, below 40 Low Match. This logic should live in a single pure function so it is easy to tune weights later or swap in an ML model without touching the rest of the app.

## 8. Technical Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), JavaScript — no TypeScript |
| UI components | shadcn/ui (built on Radix + Tailwind CSS under the hood, but components are used as pre-built, customizable primitives rather than hand-styling raw Tailwind utility classes) |
| Database | MongoDB, accessed via the official native `mongodb` driver (no Mongoose/ODM) |
| Auth | Better Auth — Email/Password + Google OAuth provider |
| Hosting target | Vercel (app) + MongoDB Atlas (database) |
| Image handling (MVP) | Direct image URL field; no file upload service in MVP |

### 8.1 UI component usage

Use shadcn/ui primitives instead of hand-built markup for all interactive elements, added via the shadcn CLI (`npx shadcn@latest add <component>`) so components live directly in the codebase and stay fully editable:
- `button`, `input`, `label`, `textarea`, `select`, `slider` (for the 1-5 cleanliness rating) — all forms (sign-up, sign-in, profile, listing creation)
- `card` — listing cards, roommate cards, dashboard summary tiles
- `badge` — compatibility score badge (Great/Good/Fair/Low Match)
- `form` (react-hook-form integration) — profile form and listing form validation
- `dialog` or `sheet` — confirmation on listing delete / mark-as-filled
- `avatar` — user profile image in navbar and roommate cards
- `tabs` — dashboard sections (My Listings / Interests Received)
- `skeleton` — loading states on listings and roommates pages
- `sonner` (toast) — save confirmations and error messages instead of inline text where appropriate

### 8.2 Suggested route structure
```
/                           landing page
/sign-up, /sign-in          auth pages (Better Auth)
/onboarding                 lifestyle profile setup wizard, shown after first sign up
/dashboard                  overview: profile status, my listings, interests received
/dashboard/profile          edit lifestyle profile
/listings                   browse all active listings with filters
/listings/new               create a listing
/listings/[id]              listing detail + compatibility badge + Express Interest
/roommates                  "Find Roommates" ranked list of other seeker profiles
/roommates/[id]             profile detail + compatibility breakdown
/api/auth/[...all]          Better Auth handler
/api/profiles               create/update/fetch current user's profile
/api/listings                list + create listings
/api/listings/[id]          get/update/delete a listing
/api/interests               express interest + view interests sent/received
/api/match                   ranked roommate suggestions for current user
```

## 9. Non-Functional Requirements

- Responsive layout — mobile and desktop, since most students will browse on phones
- Protected routes redirect unauthenticated users to `/sign-in`
- Profile must be marked complete before a user appears in match results
- Basic input validation on all forms (client and server side)
- Environment variables used for all secrets — no hard-coded credentials

### Required environment variables
```
MONGODB_URI=
MONGODB_DB_NAME=roomiefit
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 10. Post-MVP Roadmap

- Phase 2: In-app chat between matched users
- Phase 2: ID verification badge + optional background check partner integration
- Phase 2: Reviews and ratings from past roommates
- Phase 3: Photo upload service (S3/Cloudinary) instead of URL field
- Phase 3: ML-based matching using interaction data once enough usage history exists
- Phase 3: PG/owner-side monetization — promoted listings, verified badges