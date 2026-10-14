# MAREPHRAEM IDEATHON 2026
## Full-Stack Registration, Administration, Reporting, PDF Generation, and Future-Ready Event Management Platform

A centralized, full-stack TypeScript web application designed and built for **MAREPHRAEM IDEATHON 2026**, organized by the **Innovation and Entrepreneurship Development Cell (IEDC)** at **Mar Ephraem College of Engineering and Technology**, Malankara Hills, Elavuvilai, Marthandam.

---

## 1. Project Overview

MAREPHRAEM IDEATHON 2026 empowers student innovators to submit project proposals addressing critical societal challenges across 10 official verticals (and an interdisciplinary "Other Area" vertical).

### Core Capabilities
- **Public Team Registration:** Multi-member registration, Team Leader association, department, section, and faculty mentor details.
- **Official Problem Areas:** 10 pre-configured institutional themes with fixed abbreviations, plus an open "Other Area" vertical with real-time preview and dynamic abbreviations.
- **Authoritative 3-Character Abbreviation System:** Strict format `^[A-Z0-9]{3}$` with collision resolution.
- **Concurrency-Safe Project ID Generation:** Format `ABC-001` (e.g., `HCW-001`, `ASF-001`, `SHS-001`) with atomic MongoDB counter sequencing.
- **Instant Registration Confirmation:** Summary page with celebratory confetti and immediate PDF slip download.
- **Secure Administrator Console:** Cookie-based session auth, rate limiting, and generic error reporting.
- **Interactive Executive Dashboard:** Real-time KPI summaries and Recharts visual analytics.
- **Registration Management:** Multi-field search, multi-factor filtering, server-side pagination, details drawer, authorized edits (preserving issued Project IDs), and soft deletion/archival.
- **Customizable Report Header Settings:** Upload and configure institutional letterheads (PNG, JPEG, WebP up to 5 MB), image dimensions, alignments, and live preview.
- **Consolidated Registration Reports:** Multi-page table with category and field visit filters.
- **Binary PDF Generation:** Server-side PDFKit vector engine generating landscape A4 consolidated registers and portrait A4 individual verification slips with signatures.
- **Formula-Safe CSV Export:** RFC 4180-compliant CSV export with formula injection mitigation (`=`, `+`, `-`, `@`).

---

## 2. Technology Stack & Selected Versions

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | `>= v20` (tested on v24.13) | Backend runtime |
| **Language** | TypeScript | `~5.7 / ~6.0` | Strict type safety across client and server |
| **Frontend Framework** | React | `^19.0.0` | Declarative user interfaces |
| **Build Tool** | Vite | `^6.0 / ^8.3` | Ultra-fast HMR and bundle compilation |
| **Styling** | Tailwind CSS | `v4` with `@tailwindcss/vite` | Modern utility-first academic aesthetics |
| **Routing** | React Router | `^7.18.4` | Client-side routing and protected routes |
| **Icons** | Lucide React | `^1.56.0` | Modern accessible iconography |
| **Charts** | Recharts | `^3.10.1` | Responsive SVG analytics charts |
| **HTTP Client** | Axios | `^1.20.0` | Typed API client with cookie credentials |
| **Backend Framework**| Express | `^4.21.2` | REST API server |
| **Database** | MongoDB | `>= 6.0` | Primary document database |
| **ODM** | Mongoose | `^8.9.5` | Schema validation, modeling, and aggregation |
| **Validation** | Zod | `^3.24.1` | Full schema validation for inputs and env vars |
| **Security** | Helmet & Rate Limit| `helmet@8`, `express-rate-limit@7` | Security headers and rate limiting |
| **Auth & Sessions** | JWT & Cookie-Parser | `jsonwebtoken@9`, `cookie-parser@1` | HTTP-only cookie-based authentication |
| **Hashing** | BcryptJS | `^3.0.2` | Secure password hashing (12 salt rounds) |
| **File Uploads** | Multer | `^1.4.5-lts.1` | Multipart form image uploads |
| **PDF Engine** | PDFKit | `^0.16.0` | Native vector multi-page PDF generation |
| **Testing** | Vitest & React Testing Library | `vitest@3`, `@testing-library/react` | Backend and frontend automated tests |

---

## 3. Directory Structure

```text
MAREPHRAEM IDEATHON 2026/
├── client/                               # Frontend React + TypeScript application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── api/                          # Axios API client (/api/v1)
│   │   ├── components/                   # Navbar, Footer, AdminLayout, ConfirmationModal
│   │   ├── context/                      # AuthContext, ToastContext
│   │   ├── pages/                        # Home, Register, Confirmation, Admin pages
│   │   ├── types/                        # Shared TypeScript interfaces
│   │   ├── App.tsx                       # Main router configuration
│   │   ├── index.css                     # Tailwind v4 theme & print styles
│   │   ├── main.tsx                      # React root entry
│   │   └── setupTests.ts                 # Test matchers and mocks
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                               # Backend Express + TypeScript API server
│   ├── src/
│   │   ├── config/                       # env.ts (Zod validation), database.ts
│   │   ├── controllers/                  # public, auth, dashboard, registration, report, settings
│   │   ├── middleware/                   # auth, errorHandler, rateLimiter
│   │   ├── models/                       # ProblemArea, Registration, ReportSettings, SequenceCounter, Administrator
│   │   ├── routes/                       # public.routes.ts, admin.routes.ts
│   │   ├── scripts/                      # seed.ts, bootstrap-admin.ts
│   │   ├── services/                     # sequence.service, pdf.service, csv.service
│   │   ├── tests/                        # abbreviation, csv, pdf, api integration tests
│   │   ├── utils/                        # abbreviation generator & collision resolution
│   │   ├── validators/                   # Zod schemas for all endpoints
│   │   ├── app.ts                        # Express application configuration
│   │   └── server.ts                     # HTTP server startup
│   ├── package.json
│   └── tsconfig.json
├── uploads/                              # File upload storage directory
│   └── report-headers/                   # Uploaded letterhead/banner images
├── .env.example                          # Environment configuration template
├── .gitignore                            # Git ignore rules
├── package.json                          # Root orchestration package.json
└── README.md                             # Complete project documentation
```

---

## 4. Problem-Area Categories & Fixed Abbreviations

The 10 official verticals are seeded with fixed 3-character uppercase codes:

| # | Official Problem Area | Code / Abbreviation | Format Rule |
|---|---|---|---|
| 1 | Healthcare & Wellness | `HCW` | Fixed |
| 2 | Agriculture & Smart Farming | `ASF` | Fixed |
| 3 | Environment & Sustainability | `ENV` | Fixed |
| 4 | Water Management | `WMG` | Fixed |
| 5 | Education & Skill Development | `ESD` | Fixed |
| 6 | Smart Cities & Transportation | `SCT` | Fixed |
| 7 | Energy & Renewable Energy | `ERE` | Fixed |
| 8 | Industry 4.0 & Manufacturing | `I4M` | Fixed |
| 9 | Rural Development & Social Innovation | `RDS` | Fixed |
| 10 | Food Technology & Nutrition | `FTN` | Fixed |
| 11 | Other Area | Dynamically generated | Deterministic algorithm |

### Dynamic Abbreviation Algorithm for Other Area
When a team selects **Other Area** and inputs a custom title (e.g. *"Smart Healthcare Systems"*), the backend calculates:
1. Normalize, clean punctuation, and filter stop words.
2. If $\ge 3$ words: take first letter of the first three words $\rightarrow$ `SHS`.
3. If $2$ words: take first two initials + third distinct letter $\rightarrow$ `CSY`.
4. If $1$ word: take first 3 alphanumeric characters $\rightarrow$ `ROB`.
5. Ensure uppercase alphanumeric matching `^[A-Z0-9]{3}$`.
6. Deterministic collision resolution against reserved official abbreviations.

---

## 5. Automatic Project ID Generation

Format: `ABC-001`
- `ABC`: 3-character category abbreviation.
- `001`: Sequential number padded to at least 3 digits (e.g., `HCW-001`, `HCW-002`, `HCW-1000`).
- **Concurrency-Safe:** Implemented via atomic MongoDB `$inc` on `SequenceCounter` scoped per abbreviation (`SEQ_HCW`, `SEQ_ASF`, etc.).
- **Immutability:** Once issued to a registration, the Project ID and its abbreviation snapshot are never mutated during subsequent updates or category edits.

---

## 6. Installation & Quick Start

### Prerequisites
1. **Node.js** (v20 or higher recommended)
2. **MongoDB** (running locally on port 27017 or remote connection string)
3. **npm** (v10 or higher)

### Step 1: Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install in root, server, and client directories: `npm install && npm --prefix server install && npm --prefix client install`)*

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
Default configuration values:
```dotenv
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/marephraem_ideathon_2026
JWT_SECRET=super_secure_ideathon_2026_jwt_secret_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
UPLOAD_DIR=./uploads/report-headers
MAX_HEADER_IMAGE_SIZE_MB=5

ADMIN_INITIAL_EMAIL=admin@marephraem.edu.in
ADMIN_INITIAL_PASSWORD=Admin@Ideathon2026!
ADMIN_INITIAL_NAME="Ideathon Director"
```

### Step 3: Seed Official Database & Bootstrap Administrator
Seed the 11 problem areas, default report settings, and the initial administrator account:
```bash
npm run seed
npm run seed:admin
```
Output:
```text
[Seed] Successfully seeded 11 problem areas.
[Seed] Default ReportSettings created.
✅ Initial Administrator successfully bootstrapped:
   Name:     Ideathon Director
   Email:    admin@marephraem.edu.in
   Password: Admin@Ideathon2026!
   Role:     superadmin
```

### Step 4: Run Development Servers
Start both backend API (`:5000`) and frontend Vite client (`:5173`) concurrently:
```bash
npm run dev
```
Access the application:
- **Public Portal:** [http://localhost:5173](http://localhost:5173)
- **Team Registration:** [http://localhost:5173/register](http://localhost:5173/register)
- **Organizer Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 7. Testing Suite

The project includes unit, integration, and security tests across the backend and frontend.

### Run All Tests
```bash
npm test
```

### Run Server Tests Individually
```bash
npm --prefix server test
```
Tests:
- `abbreviation.test.ts`: Tests all 10 fixed abbreviations, custom 3-word, 2-word, single-word rules, punctuation, and collision resolution.
- `csv.test.ts`: Formula injection mitigation tests (sanitizing `=`, `+`, `-`, `@`, `\t`, `\r`) and RFC 4180 quotes escaping.
- `pdf.test.ts`: Binary `%PDF` magic byte headers and document buffer integrity.
- `api.test.ts`: Full integration test suite testing public health, registration creation, duplicate register number rejections, Other Area custom title requirements, admin login, and reports.

### Run Client Tests Individually
```bash
npm --prefix client test
```
Tests:
- `App.test.tsx`: Landing page rendering, navigation links, and admin shortcut.
- `Registration.test.tsx`: Form sections A (Team), B (Project), C (Supervisor), and Admin login credentials inputs.

---

## 8. Build Commands

Compile both frontend and backend for production:
```bash
npm run build
```
- Server TypeScript files compile to `server/dist/`.
- Client assets bundle into `client/dist/`.

---

## 9. API Reference

All endpoints are versioned under `/api/v1`.

### Public Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check endpoint |
| `GET` | `/api/v1/problem-areas` | Lists all active official problem areas in display order |
| `GET` | `/api/v1/abbreviation-preview?title=...` | Returns preview of dynamic 3-character abbreviation |
| `POST` | `/api/v1/registrations` | Submits team registration, allocates atomic Project ID |
| `GET` | `/api/v1/registrations/:projectId` | Public lookup of confirmed registration record |
| `GET` | `/api/v1/registrations/:id/pdf` | Downloads official individual registration PDF slip |
| `GET` | `/api/v1/uploads/header-image/:filename` | Serves safe report header image files |

### Administrator Endpoints (Protected by Cookie / Bearer JWT)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/admin/auth/login` | Administrator login (sets HTTP-only cookie) |
| `POST` | `/api/v1/admin/auth/logout` | Clears administrator session cookie |
| `GET` | `/api/v1/admin/auth/me` | Current administrator profile |
| `POST` | `/api/v1/admin/auth/change-password`| Change administrator password |
| `GET` | `/api/v1/admin/dashboard/summary` | Dashboard summary metrics & category distributions |
| `GET` | `/api/v1/admin/dashboard/timeseries` | Registration volume over time |
| `GET` | `/api/v1/admin/registrations` | Paginated search, sorting, and filtering of registrations |
| `GET` | `/api/v1/admin/registrations/:id` | Full details of a registration record |
| `PATCH`| `/api/v1/admin/registrations/:id` | Authorized edit (preserves issued Project ID) |
| `DELETE`| `/api/v1/admin/registrations/:id`| Soft delete / archival |
| `GET` | `/api/v1/admin/registrations/:id/pdf`| Download individual registration slip PDF |
| `GET` | `/api/v1/admin/reports/consolidated` | Filtered consolidated report records |
| `GET` | `/api/v1/admin/reports/registrations.csv`| Formula-safe CSV export |
| `GET` | `/api/v1/admin/reports/registrations.pdf`| Landscape A4 multi-page consolidated PDF report |
| `GET` | `/api/v1/admin/settings/report` | Fetch active report header and identity settings |
| `PUT` | `/api/v1/admin/settings/report` | Update institutional identity and appearance settings |
| `POST`| `/api/v1/admin/settings/report/header-image` | Upload / replace header image (PNG, JPG, WebP) |
| `DELETE`| `/api/v1/admin/settings/report/header-image`| Remove active header image |

---

## 10. Security Architecture

1. **Password Security:** Password hashing using `bcryptjs` with 12 salt rounds; passwords never stored or logged in plaintext.
2. **Cookie-Based Authentication:** Tokens stored in `httpOnly`, `sameSite: 'lax'` cookies; client JavaScript cannot access the session token.
3. **Rate Limiting:** Protects `/api/v1/admin/auth/login` (max 20 attempts per 15 min) and `/api/v1/registrations` (max 100 registrations per 15 min).
4. **CSV Formula Injection Mitigation:** Sanitizes any field starting with `=`, `+`, `-`, `@`, `\t`, `\r` by prepending a single quote (`'`), preventing malicious execution in Microsoft Excel and LibreOffice Calc.
5. **Path Traversal Protection:** Multer uploads use cryptographic random filenames (`crypto.randomBytes(8)`). File serving sanitizes paths using `path.basename`.
6. **No Client ID Tampering:** Client cannot pass or manipulate issued Project IDs; generation is strictly executed server-side.
7. **Cross-Origin Resource Sharing (CORS):** Explicit allowlist origin configuration.

---

## 11. Future-Ready Architecture (Phase 2+)

The codebase is organized so future modules can be added cleanly without refactoring the registration core:
- **Student Portal:** The `Registration` model includes team member details and register numbers, ready to be linked with student authentication accounts.
- **Project Submissions:** File upload abstraction in `src/controllers/settings.controller.ts` can be extended with a `Submission` model for PDF decks and code archives.
- **Evaluation & Scoring:** `Registration._id` serves as a clean foreign key for `Rubric`, `JudgeScore`, and `Round` models.
- **Certificates:** The `pdf.service.ts` architecture already includes vector certificate generation foundations with signatures.
