# Freelance Marketplace — Backend API Documentation (Postman)

**Base URL:** `http://localhost:5000/api` (port from `PORT` env, default `5000`)

**Content-Type:** `application/json` for all endpoints **except** `POST /api/uploads/avatar` (multipart/form-data) and the Paystack webhook (raw body).

**Authentication:** JWT Bearer token passed in the header:

```
Authorization: Bearer <token>
```

Tokens are issued only by `POST /api/auth/login` and expire after `JWT_EXPIRES_IN` (default `7d`).

**Roles:** `CLIENT`, `FREELANCER`, `ADMIN`

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Global Error Format](#2-global-error-format)
3. [Health & Static](#3-health--static)
4. [Authentication](#4-authentication)
5. [Users](#5-users)
6. [Jobs](#6-jobs)
7. [Proposals](#7-proposals)
8. [Projects](#8-projects)
9. [Milestones](#9-milestones)
10. [Workroom (Submit / Approve)](#10-workroom-submit---approve)
11. [Payments](#11-payments)
12. [Wallets & Withdrawals](#12-wallets--withdrawals)
13. [Paystack Webhook](#13-paystack-webhook)
14. [Reviews](#14-reviews)
15. [Messages](#15-messages)
16. [Disputes](#16-disputes)
17. [Notifications](#17-notifications)
18. [Uploads](#18-uploads)
19. [Rate Limiting](#19-rate-limiting)
20. [Postman Setup](#20-postman-setup)

---

## 1. Conventions

### Success response shape

Every successful response has `success: true` plus a payload under `data` (or a top-level array, as noted per endpoint):

```json
{ "success": true, "message": "Optional human-readable message", "data": { } }
```

### Authentication requirements legend

| Symbol | Meaning |
|---|---|
| 🌐 **Public** | No token required |
| 🔒 **Authenticated** | Valid JWT of any active role (`CLIENT` / `FREELANCER` / `ADMIN`) |
| 👑 **Role-restricted** | Valid JWT **and** one of the listed roles required |

### Common authentication errors (apply to every 🔒 / 👑 endpoint)

| Status | Response |
|---|---|
| 401 | `{"success":false,"message":"Authentication required"}` — missing header or not `Bearer <token>` |
| 401 | `{"success":false,"message":"Authentication token is missing"}` |
| 401 | `{"success":false,"message":"Token has expired"}` |
| 401 | `{"success":false,"message":"Invalid authentication token"}` |
| 401 | `{"success":false,"message":"User no longer exists"}` |
| 403 | `{"success":false,"message":"Your account has been deactivated"}` |
| 403 | `{"success":false,"message":"You are not authorized to perform this action"}` — wrong role |

> **Path-parameter validation runs first:** every `:id`-style path parameter is checked against the Mongo ObjectId format (Zod, via `router.param`) *before* authentication. A malformed ID returns `400 {"success":false,"message":"Invalid ID format"}` even on a request with no token; a well-formed ID without a token still returns `401` as listed above.

---

## 2. Global Error Format

Handled by the global error middleware (`backend/src/middleware/errorMiddleware.js`):

```json
{ "success": false, "message": "Error description" }
```

| Status | Source | Example message |
|---|---|---|
| 400 | Zod validation failure — request **body** or **query string** | `{"success":false,"message":"Name must be at least 2 characters","errors":[{"field":"name","message":"Name must be at least 2 characters"}]}` |
| 400 | Mongoose `ValidationError` | joined model messages |
| 400 | Mongoose `CastError` **or** ObjectId path-param check (`router.param`, runs before auth) | `"Invalid ID format"` |
| 400 | Multer | `"File is too large (5MB max)"` / `"Only JPEG, PNG, WEBP, or GIF images are allowed"` |
| 401 | Auth middleware | see [§1](#common-authentication-errors) |
| 403 | Role/ownership guard | see per-endpoint tables |
| 404 | Resource not found | `"Job not found"`, `"User not found"`… |
| 409 | Duplicate key (code 11000) | `"<field> already exists"` |
| 429 | Rate limiter | `"Too many attempts. Please try again later."` (auth routes) |
| 500 | Unhandled / unexpected error | `"Internal server error"` or the thrown message (operational failures — not-found, forbidden, wrong state, conflicts — return `AppError` **4xx**, see per-endpoint tables) |

---

## 3. Health & Static

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/` | GET | API health check | 🌐 Public | — | — | **200** `{"success":true,"message":"Freelance Marketplace API is running"}` | **500** `{"success":false,"message":"Internal server error"}` |
| `/uploads/avatars/<file>` | GET | Serve uploaded avatar images (static) | 🌐 Public | — | Path: `file` (image filename) | **200** image binary | **404** file not found |

---

## 4. Authentication

Mounted at `/api/auth` — subject to the stricter auth rate limit (20 requests / 15 min).

### 4.1 POST `/api/auth/register`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/register` |
| **HTTP Method** | `POST` |
| **Purpose** | Create a new `CLIENT` or `FREELANCER` account and send an email-verification link |
| **Authentication** | 🌐 Public |
| **Request body (JSON)** | see below |
| **Parameters** | — |

**Request body:**

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | trimmed, 2–100 chars |
| `email` | string | ✅ | valid email, lowercased |
| `password` | string | ✅ | 8–72 chars, must contain uppercase, lowercase and a digit |
| `role` | string | ❌ | `"CLIENT"` \| `"FREELANCER"` (default `FREELANCER`; `ADMIN` not allowed) |

**Successful response:**

```json
// 201 Created
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "665f...", "name": "Jane Doe", "email": "jane@example.com",
      "role": "FREELANCER", "avatar": "", "bio": "", "location": "", "skills": [],
      "hourlyRate": 0, "isActive": true, "isEmailVerified": false, "createdAt": "..."
    }
  }
}
```

**Error responses:**

| Status | Message |
|---|---|
| 400 | Validation errors (per field, with `errors[]` array) |
| 403 | `"Admin accounts cannot be created through registration"` |
| 409 | `"An account with this email already exists"` |
| 500 | `"Account created, but we could not send the verification email..."` |

---

### 4.2 GET `/api/auth/verify-email`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/verify-email` |
| **HTTP Method** | `GET` |
| **Purpose** | Verify a user's email address from the emailed link |
| **Authentication** | 🌐 Public |
| **Request body** | — |
| **Parameters** | Query: `token` (string, required) — raw verification token, **schema-validated** (Zod) |

**Successful response:**

```json
// 200 OK
{ "success": true, "message": "Email verified successfully",
  "data": { "user": { "_id": "...", "name": "...", "email": "...", "role": "FREELANCER", "isEmailVerified": true } } }
```

**Error responses:**

| Status | Message |
|---|---|
| 400 | `"Verification token is required"` |
| 400 | `"Verification link is invalid or has expired"` |

---

### 4.3 POST `/api/auth/resend-verification`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/resend-verification` |
| **HTTP Method** | `POST` |
| **Purpose** | Re-send the email-verification link |
| **Authentication** | 🌐 Public |
| **Request body (JSON)** | `{"email": "user@example.com"}` — string, valid email, required |
| **Parameters** | — |

**Successful response:** **200** `{"success":true,"message":"A new verification email has been sent"}`

**Error responses:**

| Status | Message |
|---|---|
| 400 | Validation error on `email` |
| 400 | `"Your email is already verified"` |
| 404 | `"No account was found with this email"` |
| 500 | `"We could not send the verification email..."` |

---

### 4.4 POST `/api/auth/login`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/login` |
| **HTTP Method** | `POST` |
| **Purpose** | Authenticate a user and issue a JWT |
| **Authentication** | 🌐 Public (rate limited: 20 / 15 min) |
| **Request body (JSON)** | see below |
| **Parameters** | — |

**Request body:**

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | ✅ | valid email |
| `password` | string | ✅ | min 1 char |

**Successful response:**

```json
// 200 OK
{
  "success": true, "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "CLIENT",
              "avatar": "", "bio": "", "location": "", "skills": [], "hourlyRate": 0,
              "isActive": true, "isEmailVerified": true, "createdAt": "..." },
    "token": "<JWT>"
  }
}
```

**Error responses:**

| Status | Message |
|---|---|
| 400 | Validation errors |
| 401 | `"Invalid email or password"` |
| 403 | `"Your account has been deactivated"` |
| 403 | `"Please verify your email before logging in"` |
| 429 | `"Too many attempts. Please try again later."` |

---

### 4.5 POST `/api/auth/forgot-password`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/forgot-password` |
| **HTTP Method** | `POST` |
| **Purpose** | Start the password-reset flow (emails a reset link) |
| **Authentication** | 🌐 Public |
| **Request body (JSON)** | `{"email": "user@example.com"}` — string, valid email, required |
| **Parameters** | — |

**Successful response:** **200** `{"success":true,"message":"If an account with that email exists, a password reset link has been sent."}` (same response whether or not the account exists)

**Error responses:** **400** validation errors · **500** email send failure

---

### 4.6 POST `/api/auth/reset-password`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/reset-password` |
| **HTTP Method** | `POST` |
| **Purpose** | Set a new password using a reset token |
| **Authentication** | 🌐 Public |
| **Request body (JSON)** | see below |

**Request body:**

| Field | Type | Required | Rules |
|---|---|---|---|
| `token` | string | ✅ | min 1 char (from the reset email) |
| `password` | string | ✅ | 8–72 chars, uppercase + lowercase + digit |

**Successful response:** **200** `{"success":true,"message":"Password reset successfully. You can now log in with your new password."}`

**Error responses:**

| Status | Message |
|---|---|
| 400 | Validation errors |
| 400 | `"Reset token is required"` |
| 400 | `"Password reset link is invalid or has expired"` |
| 500 | `"Internal server error"` |

---

### 4.7 GET `/api/auth/me`

| Field | Value |
|---|---|
| **Endpoint** | `/api/auth/me` |
| **HTTP Method** | `GET` |
| **Purpose** | Get the currently authenticated user's profile |
| **Authentication** | 🔒 Authenticated (any role) |
| **Request body** | — |
| **Parameters** | — |

**Successful response:**

```json
// 200 OK
{ "success": true, "data": { "user": { "_id": "...", "name": "...", "email": "...", "role": "CLIENT",
  "avatar": "", "bio": "", "location": "", "skills": [], "hourlyRate": 0,
  "isActive": true, "isEmailVerified": true, "createdAt": "..." } } }
```

**Error responses:** **401** auth errors (§1) · **404** `"User not found"`

---

## 5. Users

Mounted at `/api/users`. Route order: `/me` and `/admin/all` are registered before `/:id`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/users/me` | PATCH | Update own profile (name, avatar, bio, location, skills, hourlyRate) | 🔒 Authenticated | `{"name","avatar","bio","location","skills":[],"hourlyRate"}` — all optional; `name` 2–100, `bio` ≤1000, `avatar` ≤1000, `location` ≤150, `hourlyRate` ≥ 0. **Strict schema** — unknown fields rejected | — | **200** `{"success":true,"message":"Profile updated successfully","data":{"user":{...}}}` | **400** validation (`errors[]`) · **401** auth · **404** `"User not found"` |
| `/api/users/admin/all` | GET | List all users (admin user management) | 👑 `ADMIN` | — | Query: `page` (int, default 1), `limit` (int, default 25, max 100), `role` (`CLIENT\|FREELANCER\|ADMIN`), `search` (matches name/email) — **schema-validated** | **200** `{"success":true,"data":{"users":[...],"pagination":{"page":1,"limit":25,"total":10,"totalPages":1}}}` | **400** query validation (`errors[]`, e.g. `role` not in enum, `limit` out of range) · **401** auth · **403** wrong role |
| `/api/users/:id/status` | PATCH | Activate or deactivate a user account | 👑 `ADMIN` | `{"isActive": true\|false}` — boolean, **required** | Path: `id` (Mongo ObjectId) | **200** `{"success":true,"message":"User account reactivated" \| "User account deactivated","data":{"user":{...}}}` | **400** `"You cannot change your own account status"` · **400** `"Admin accounts cannot be deactivated from here"` · **400** validation · **401/403** · **404** `"User not found"` |
| `/api/users` | GET | Browse/search freelancers | 🔒 Authenticated | — | Query: `skill` (matches skills array), `search` (name), `minRating` (number 0–5), `page` (≥1), `limit` (default 20, max 50) — **schema-validated** | **200** `{"success":true,"data":{"freelancers":[{"name","avatar","bio","location","skills","hourlyRate","role","averageRating","reviewCount","createdAt"}],"pagination":{...}}}` | **400** query validation (`errors[]`) · **401** auth |
| `/api/users/:id` | GET | View a user's public profile | 🔒 Authenticated | — | Path: `id` (Mongo ObjectId) | **200** `{"success":true,"data":{"user":{"name","avatar","bio","location","skills","hourlyRate","role","averageRating","reviewCount","createdAt"}}}` | **401** auth · **400** `"Invalid ID format"` · **404** `"User not found"` |
| `/api/users/:id/reviews` | GET | Reviews received by a user | 🔒 Authenticated | — | Path: `id` (Mongo ObjectId) | **200** `{"success":true,"data":{"reviews":[{...,"reviewer":{"name","avatar","role"},"project":{"title"}}]}}` | **401** auth · **400** `"Invalid ID format"` · **404** `"User not found"` |

---

## 6. Jobs

Mounted at `/api/jobs`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/jobs` | GET | Browse open jobs (job feed) | 🌐 **Public** (no `protect` middleware) | — | Query: `page` (default 1), `limit` (default 10, max 100), `category`, `skill` — **schema-validated** | **200** `{"success":true,"data":[{...job}],"totalDocuments":n,"totalPages":n,"currentPage":n}` | **400** query validation (`errors[]`, e.g. non-integer `page`) · **500** |
| `/api/jobs` | POST | Post a new job | 👑 `CLIENT` | `{"title","description","category?","skills?[] ,"budget","budgetType?","deadline?"}` — `title` 5–150 chars; `description` 20–5000 chars; `budget` number **> 0** (required); `budgetType` `"FIXED"\|"HOURLY"`; `deadline` ISO datetime; `category` ≤100 chars | — | **201** `{"success":true,"message":"Job posted successfully","data":{"job":{...}}}` | **400** validation · **401** auth · **403** non-client |
| `/api/jobs/my` | GET | List the logged-in client's own jobs | 👑 `CLIENT` | — | — | **200** `{"success":true,"data":{"jobs":[...]}}` (sorted newest first) | **401** auth · **403** non-client |
| `/api/jobs/admin/all` | GET | List all jobs (any status) for moderation | 👑 `ADMIN` | — | — | **200** `{"success":true,"data":{"jobs":[..., "client":{"name","email","avatar"}]}}` | **401** auth · **403** non-admin |
| `/api/jobs/:id` | GET | View job details | 🔒 Authenticated | — | Path: `id` (Mongo ObjectId) | **200** `{"success":true,"data":{"job":{...,"client":{"name","avatar","location","bio"}}}}` | **400** `"Invalid ID format"` · **401** · **404** `"Job not found"` |
| `/api/jobs/:id` | PATCH | Update an own **OPEN** job | 👑 `CLIENT` (owner) | Same fields as POST, **all optional** | Path: `id` | **200** `{"success":true,"message":"Job updated successfully","data":{"job":{...}}}` | **400** validation / `"Only open jobs can be edited"` · **401/403** · **404** `"Job not found"` · **403** `"Only the job owner can update this job"` |
| `/api/jobs/:id` | DELETE | Delete an own **OPEN** job | 👑 `CLIENT` (owner) | — | Path: `id` | **200** `{"success":true,"message":"Job deleted successfully"}` | **400** `"Only open jobs can be deleted"` · **401/403** · **403** `"Only the job owner can delete this job"` · **404** `"Job not found"` |
| `/api/jobs/admin/:id` | DELETE | Remove any job (moderation); closes it instead if a project exists | 👑 `ADMIN` | — | Path: `id` | **200** `{"success":true,"message":"Job deleted" \| "Job has an associated project, so it was closed instead of deleted","data":{"job":{...},"deleted":true\|false}}` | **401** · **403** · **404** `"Job not found"` |

---

## 7. Proposals

Router mounted directly on `/api`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/jobs/:jobId/proposals` | POST | Submit a proposal to a job | 👑 `FREELANCER` | `{"coverLetter","bidAmount","estimatedDuration"}` — `coverLetter` 20–3000 chars; `bidAmount` number **> 0**; `estimatedDuration` integer **> 0** | Path: `jobId` | **201** `{"success":true,"message":"Proposal submitted successfully","data":{"proposal":{...,"job":{...},"freelancer":{...}}}}` | **400** `"You can only apply to open jobs"` / `"You cannot submit a proposal to your own job"` / validation · **401/403** · **404** `"Job not found"` · **409** `"You have already submitted a proposal for this job"` |
| `/api/jobs/:jobId/proposals` | GET | List proposals on the client's own job | 👑 `CLIENT` (owner) | — | Path: `jobId` | **200** `{"success":true,"data":{"proposals":[...,"freelancer":{"name","email","avatar","bio","skills","hourlyRate"}]}}` | **401/403** · **403** `"You can only view proposals for your own jobs"` · **404** `"Job not found"` |
| `/api/proposals/my` | GET | List my submitted proposals | 👑 `FREELANCER` | — | — | **200** `{"success":true,"data":{"proposals":[...,"job":{"title","description","budget","budgetType","deadline","status"}]}}` | **401** · **403** |
| `/api/proposals/client` | GET | List all proposals received on my jobs | 👑 `CLIENT` | — | — | **200** `{"success":true,"data":{"proposals":[...]}}` | **401** · **403** |
| `/api/proposals/:id` | GET | View a single proposal | 🔒 Authenticated (client or its freelancer only) | — | Path: `id` | **200** `{"success":true,"data":{"proposal":{...}}}` | **401** · **403** `"You are not authorized to view this proposal"` · **404** `"Proposal not found"` |
| `/api/proposals/:id/accept` | PATCH | Accept a proposal → creates project, contract, milestone and payment | 👑 `CLIENT` (job owner) | — | Path: `id` | **201** `{"success":true,"message":"Proposal accepted. Project, contract, milestone and payment created successfully.","data":{"projectId","contractId","milestoneId","paymentId","paymentReference","status":"AWAITING_PAYMENT"}}` | **400** `"This proposal is no longer available"` / `"This job is no longer open"` · **401/403** · **403** `"You are not allowed to accept this proposal"` · **404** `"Proposal not found"` / `"The job associated with this proposal no longer exists"` · **409** `"A project already exists for this job"` |
| `/api/proposals/:id/reject` | PATCH | Reject a pending proposal | 👑 `CLIENT` (job owner) | — | Path: `id` | **200** `{"success":true,"message":"Proposal rejected successfully","data":{"proposal":{...}}}` | **400** `"Only pending proposals can be rejected"` · **401/403** · **403** `"You can only reject proposals for your own jobs"` · **404** `"Proposal not found"` |

---

## 8. Projects

Router mounted directly on `/api`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/admin/projects` | GET | List all projects (admin view) | 👑 `ADMIN` | — | — | **200** `{"success":true,"data":{"projects":[...,"client":{},"freelancer":{},"job":{}]}}` | **401** · **403** |
| `/api/projects` | GET | List my projects (auto-filtered by role) | 🔒 `ADMIN` \| `CLIENT` \| `FREELANCER` | — | — | **200** `{"success":true,"data":{"projects":[...]}}` (CLIENT → own as client, FREELANCER → own as freelancer, ADMIN → all) | **401** · **500** |
| `/api/projects/:id` | GET | View project details | 🔒 `ADMIN` \| `CLIENT` \| `FREELANCER` (participants) | — | Path: `id` | **200** `{"success":true,"data":{"project":{...,"client":{},"freelancer":{},"job":{},"proposal":{}}}}` | **400** `"Invalid ID format"` · **401** · **403** `"You are not authorized to view this project"` (ADMIN bypasses) · **404** `"Project not found"` |
| `/api/projects/:id` | PATCH | Update project title/description | 👑 `CLIENT` (project owner) | `{"title?","description?"}` — `title` 3–150, `description` 10–5000 (both optional) | Path: `id` | **200** `{"success":true,"message":"Project updated successfully","data":{"project":{...}}}` | **400** `"Only active projects can be updated"` / validation · **401/403** · **403** `"Only the project client can update this project"` · **404** `"Project not found"` |
| `/api/projects/:id/cancel` | PATCH | Cancel an active project (unfinished milestones → `REJECTED`) | 👑 `CLIENT` (project owner) | — | Path: `id` | **200** `{"success":true,"message":"Project cancelled successfully","data":{"project":{...}}}` | **400** `"Only active projects can be cancelled"` · **401/403** · **403** non-client · **404** `"Project not found"` |
| `/api/projects/:id/complete` | PATCH | Complete an active project (all milestones must be approved) | 👑 `CLIENT` (project owner) | — | Path: `id` | **200** `{"success":true,"message":"Project completed successfully","data":{"project":{...}}}` | **400** `"Only active projects can be completed"` · **400** `"Project must have at least one milestone"` · **400** `"All milestones must be approved before completing the project"` · **401/403** · **404** `"Project not found"` |

---

## 9. Milestones

Router mounted directly on `/api`. (Submit / request-changes / approve live in [§10](#10-workroom-submit---approve).)

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/projects/:projectId/milestones` | POST | Create a milestone on an active project | 👑 `CLIENT` (project owner) | `{"title","description","amount","dueDate"}` — `title` 3–150; `description` 10–2000; `amount` number **> 0**; `dueDate` ISO datetime (must be in the future) | Path: `projectId` | **201** `{"success":true,"message":"Milestone created successfully","data":{"milestone":{...}}}` | **400** `"Milestones can only be created for active projects"` · **400** `"Milestone due date must be in the future"` · **400** `"Milestone amount exceeds the remaining project budget"` · **400** validation · **401/403** · **403** `"Only the project client can create milestones"` · **404** `"Project not found"` |
| `/api/projects/:projectId/milestones` | GET | List a project's milestones | 🔒 `CLIENT` \| `FREELANCER` (participants) | — | Path: `projectId` | **200** `{"success":true,"data":{"milestones":[...]}}` (sorted by `dueDate`) | **401** · **403** `"You are not authorized to access this project"` · **404** `"Project not found"` |
| `/api/milestones/:id` | GET | View milestone details | 🔒 `CLIENT` \| `FREELANCER` (participants) | — | Path: `id` | **200** `{"success":true,"data":{"milestone":{...,"project":{}}}}` | **401** · **403** `"You are not authorized to view this milestone"` · **404** `"Milestone not found"` |
| `/api/milestones/:id` | PATCH | Update a milestone | 👑 `CLIENT` (project owner) | `{"title?","description?","amount?","dueDate?"}` — same rules as create, all optional | Path: `id` | **200** `{"success":true,"message":"Milestone updated successfully","data":{"milestone":{...}}}` | **400** `"Approved milestones cannot be updated"` · **400** `"Milestone due date must be in the future"` · **400** `"Milestone amount exceeds the project budget"` · **401/403** · **403** `"Only the project client can update milestones"` · **404** `"Milestone not found"` |
| `/api/milestones/:id` | DELETE | Delete a milestone | 👑 `CLIENT` (project owner) | — | Path: `id` | **200** `{"success":true,"message":"Milestone deleted successfully"}` | **400** `"Submitted or approved milestones cannot be deleted"` · **401/403** · **403** `"Only the project client can delete milestones"` · **404** `"Milestone not found"` |
| `/api/milestones/:id/start` | PATCH | Freelancer starts working on a milestone | 👑 `FREELANCER` (assignee) | — | Path: `id` | **200** `{"success":true,"message":"Milestone started successfully","data":{"milestone":{...}}}` | **400** `"This milestone cannot be started"` (must be `PENDING`/`REJECTED`) · **401/403** · **403** `"Only the assigned freelancer can start this milestone"` · **404** `"Milestone not found"` |
| `/api/milestones/:id/reject` | PATCH | Client rejects a submitted milestone | 👑 `CLIENT` (project owner) | — | Path: `id` | **200** `{"success":true,"message":"Milestone rejected successfully","data":{"milestone":{...}}}` | **400** `"Only submitted milestones can be rejected"` · **401/403** · **403** `"Only the project client can reject milestones"` · **404** `"Milestone not found"` |

---

## 10. Workroom (Submit / Approve)

Router mounted directly on `/api`. Participation checks happen inside the controllers.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/projects/:projectId/workroom` | GET | Get the full workroom view: project, contract, milestones, activity feed | 🔒 Authenticated (project participants only) | — | Path: `projectId` | **200** `{"success":true,"data":{"project":{},"contract":{},"milestones":[],"activities":[]}}` | **401** · **403** `"You are not part of this project"` · **404** `"Project not found"` |
| `/api/milestones/:milestoneId/submit` | POST | Freelancer submits milestone work for review | 🔒 `FREELANCER` (assigned) | `{"message": "string (required, non-empty after trim, ≤5000 chars)", "attachments": [{"name?","url","mimeType?","size?"}] (optional)}` — **Zod-validated** | Path: `milestoneId` | **201** `{"success":true,"message":"Milestone submitted successfully"}` | **400** `"Submission message is required"` (Zod, `errors[]`) · **400** `"This milestone cannot be submitted in its current state"` (needs `FUNDED`/`IN_PROGRESS`) · **401** · **403** `"Only the assigned freelancer can submit this milestone"` · **404** `"Milestone not found"` / `"Active contract not found"` |
| `/api/milestones/:milestoneId/request-changes` | POST | Client requests revisions on a submitted milestone | 🔒 `CLIENT` (project owner) | `{"message": "string (required, non-empty after trim, ≤5000 chars)"}` — **Zod-validated** | Path: `milestoneId` | **200** `{"success":true,"message":"Revision requested successfully"}` | **400** `"Please explain what needs to be changed"` (Zod, `errors[]`) · **400** `"Milestone is not awaiting review"` (must be `SUBMITTED`) · **401** · **403** `"Only the client can request changes"` · **404** `"Milestone not found"` / `"Active submission not found"` |
| `/api/milestones/:milestoneId/approve` | POST | Client approves the milestone → releases escrow payment to freelancer wallet | 🔒 `CLIENT` (project owner) | — | Path: `milestoneId` | **200** `{"success":true,"message":"Milestone approved and payment released"}` | **400** `"Milestone is not awaiting approval"` / `"Insufficient pending wallet balance"` · **401** · **403** `"Only the client can approve this milestone"` · **404** `"Milestone not found"` / `"No pending submission found"` / `"Funded payment not found"` |

---

## 11. Payments

Mounted at `/api/payments` (Paystack integration).

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/payments/initialize` | POST | Initialize escrow funding for a milestone → returns Paystack checkout URL | 🔒 `CLIENT` (project owner) | `{"milestoneId": "string (required, min 1)"}` | — | **200** `{"success":true,"message":"Payment initialized successfully","data":{"paymentId","reference","authorizationUrl","accessCode","amount","clientFee","totalClientCharge"}}` | **400** `"This milestone cannot be funded"` (must be `PENDING`/`REVISION_REQUESTED`) · **400** `"This milestone already has an active payment"` · **400** validation · **401/403** · **403** `"You are not authorized to fund this milestone"` · **404** `"Milestone not found"` / `"Client not found"` · **500** `"Unable to initialize payment"` |
| `/api/payments/verify` | POST | Verify a Paystack transaction after checkout and activate the milestone | 🔒 Authenticated | `{"reference": "string (required, non-empty after trim)"}` — **Zod-validated** | — | **200** `{"success":true,"message":"Payment verified successfully","data":{"payment":{...payment doc},"transaction":{"status","reference","amount","currency","id"}}}` (flat — `data.payment` and `data.transaction`) | **400** `"Payment reference is required"` (Zod, `errors[]`) · **400** `"Payment amount mismatch"` · **401** · **404** `"Payment record not found"` |

> Note: `POST /api/payments/release` was removed — escrow release happens via `POST /api/milestones/:milestoneId/approve` (§10).

---

## 12. Wallets & Withdrawals

Both routers are mounted at `/api/wallets`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/wallets` | GET | Get (or create) my wallet | 🔒 Authenticated | — | — | **200** `{"success":true,"data":{"wallet":{"_id","user","pendingBalance","availableBalance","totalEarned","totalWithdrawn","currency":"NGN","createdAt","updatedAt"}}}` | **401** · **500** |
| `/api/wallets/banks` | GET | List supported banks (for payout setup) | 🔒 Authenticated | — | — | **200** `{"success":true,"data":{"banks":[{"name":"...","code":"..."}]}}` | **401** · **500** upstream failure |
| `/api/wallets/withdrawal-account` | GET | Get my saved payout account | 👑 `FREELANCER` | — | — | **200** `{"success":true,"data":{"account": null \| {"_id","bankName","bankCode","accountName","accountNumberMasked":"••••1234","verified":true}}}` | **401** · **403** non-freelancer |
| `/api/wallets/withdrawal-account` | POST | Save & verify a payout account | 👑 `FREELANCER` | `{"bankCode","bankName","accountNumber"}` — `bankCode`/`bankName` required (min 1); `accountNumber` exactly 10 digits | — | **200** `{"success":true,"message":"Withdrawal account saved successfully","data":{"account":{...}}}` | **400** `"Unable to verify this bank account. Please check the account number and bank."` / validation · **401/403** · **500** `"Unable to set up this withdrawal account"` |
| `/api/wallets/withdraw` | POST | Request a withdrawal to my bank account | 👑 `FREELANCER` | `{"amount": number (> 0, required)}` | — | **201** `{"success":true,"message":"Withdrawal initiated successfully","data":{"withdrawal":{...}}}` | **400** `"Minimum withdrawal amount is 100"` · **400** `"Set up a verified withdrawal account before requesting a withdrawal"` · **400** `"Insufficient available balance"` · **400** validation · **401/403** · **500** `"Unable to initiate withdrawal. Your balance has been refunded."` |
| `/api/wallets/withdrawals` | GET | My withdrawal history | 👑 `FREELANCER` | — | — | **200** `{"success":true,"data":{"withdrawals":[...]}}` | **401** · **403** |

---

## 13. Paystack Webhook

| Field | Value |
|---|---|
| **Endpoint** | `/api/webhooks/paystack` |
| **HTTP Method** | `POST` |
| **Purpose** | Receive Paystack events (`charge.success`, `transfer.success`, `transfer.failed`, `transfer.reversed`) and settle escrow/transfers |
| **Authentication** | **HMAC signature** — header `x-paystack-signature` = `sha512(raw body + PAYSTACK_SECRET_KEY)`. **No JWT.** |
| **Request body (raw JSON)** | Paystack event payload, e.g. `{"event":"charge.success","data":{"reference":"..."}}` |
| **Parameters** | — |

**Successful response:** **200** `{"message":"Payment processed successfully"}` — other 200 messages: `"Transfer event processed"` · `"Event received"` · `"Webhook already processed"` · `"Payment not found in marketplace"` · `"Payment already processed"` · `"Milestone not found"` · `"Project not found"`

**Error responses:**

| Status | Message |
|---|---|
| 401 | `"Invalid Paystack signature"` |
| 400 | `"Invalid webhook payload"` / `"Payment reference missing"` / `"Payment amount mismatch"` / `"Payment currency mismatch"` |
| 500 | `"Webhook processing failed"` (intentional — makes Paystack retry) |

---

## 14. Reviews

Router mounted directly on `/api`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/projects/:projectId/review` | POST | Leave a review for a completed project | 🔒 Authenticated (project participants only) | `{"rating": number 1–5 (required), "communicationRating?": 1–5, "qualityRating?": 1–5, "deadlineRating?": 1–5, "comment?": string ≤2000}` — **Zod-validated** (sub-ratings/comment may also be `null`) | Path: `projectId` | **201** `{"success":true,"message":"Review submitted successfully","data":{...review}}` | **400** `"Rating must be between 1 and 5"` (Zod, `errors[]`) · **400** `"Reviews can only be submitted for completed projects"` (project must be `COMPLETED`) · **401** · **403** `"Only project participants can leave reviews"` · **404** `"Project not found"` · **409** `"You have already reviewed this project"` |
| `/api/projects/:projectId/reviews` | GET | List reviews for a project | 🔒 Authenticated (participants only) | — | Path: `projectId` | **200** `{"success":true,"data":{"reviews":[...,"reviewer":{"name","avatar","role"}]}}` | **401** · **403** `"Only project participants can view these reviews"` · **404** `"Project not found"` |

> Side effect of `POST`: the reviewee's `averageRating` (rounded to 1 dp) and `reviewCount` are recalculated.

---

## 15. Messages

Router mounted directly on `/api`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/projects/:projectId/messages` | POST | Send a message in a project's chat | 🔒 Authenticated (participants only) | `{"message": string 1–5000 (required), "attachments?": [{"name?","url","mimeType?","size?"}]}` | Path: `projectId` | **201** `{"success":true,"message":"Message sent successfully","data":{"message":{...}}}` | **400** validation · **401** · **403** `"You are not a participant on this project"` · **404** `"Project not found"` |
| `/api/projects/:projectId/messages` | GET | Get the full conversation for a project | 🔒 Authenticated (participants only) | — | Path: `projectId` | **200** `{"success":true,"data":{"messages":[...,"sender":{"name","avatar"},"receiver":{"name","avatar"}]}}` (oldest first) | **401** · **403** · **404** `"Project not found"` |
| `/api/projects/:projectId/messages/read` | PATCH | Mark all messages in the project as read | 🔒 Authenticated (participants only) | — | Path: `projectId` | **200** `{"success":true,"message":"Messages marked as read"}` | **401** · **403** · **404** `"Project not found"` |
| `/api/messages/unread-count` | GET | Total unread message count for me | 🔒 Authenticated | — | — | **200** `{"success":true,"data":{"count": 5}}` | **401** |
| `/api/messages/conversations` | GET | List my conversations with last message + unread count | 🔒 Authenticated | — | — | **200** `{"success":true,"data":{"conversations":[{"projectId","projectTitle","participant":{"_id","name","avatar"},"lastMessage":{"message","sender","createdAt"},"unreadCount":2,"updatedAt":"..."}]}}` | **401** |

---

## 16. Disputes

Router mounted directly on `/api`.

| Endpoint | Method | Purpose | Authentication | Request body | Parameters | Successful response | Error response |
|---|---|---|---|---|---|---|---|
| `/api/milestones/:milestoneId/dispute` | POST | Open a dispute on a milestone | 🔒 Authenticated (milestone participants) | `{"reason": enum (required), "description": string ≤5000 (required), "evidence?": [{"name?","url","mimeType?"}]}` — `reason` ∈ `NON_PAYMENT`, `POOR_QUALITY`, `SCOPE_DISAGREEMENT`, `MISSED_DEADLINE`, `NON_DELIVERY`, `FRAUD`, `OTHER` — **Zod-validated** | Path: `milestoneId` | **201** `{"success":true,"message":"Dispute opened successfully"}` | **400** `"Reason and description are required"` / `"Invalid dispute reason"` (Zod, `errors[]`) · **401** · **403** `"You are not part of this milestone"` · **404** `"Milestone not found"` · **409** `"An active dispute already exists"` |
| `/api/disputes/:disputeId/resolve` | PATCH | Resolve a dispute (admin decision) | 👑 `ADMIN` | `{"decision": enum (required), "resolution": string (required, non-empty after trim)}` — `decision` ∈ `RESOLVED_CLIENT`, `RESOLVED_FREELANCER`, `PARTIAL_RESOLUTION` — **Zod-validated** | Path: `disputeId` | **200** `{"success":true,"message":"Dispute resolved successfully"}` | **400** `"Invalid dispute decision"` / `"Resolution explanation is required"` (Zod, `errors[]`) · **400** `"Dispute has already been resolved"` · **401/403** · **404** `"Dispute not found"` |
| `/api/disputes` | GET | List all disputes (filterable) | 👑 `ADMIN` | — | Query: `status` (dispute-status enum) — **schema-validated** | **200** `{"success":true,"data":{"disputes":[...,"project":{},"milestone":{},"openedBy":{},"against":{},"resolvedBy":{}]}}` | **400** query validation (`errors[]`, e.g. unknown `status`) · **401** · **403** |
| `/api/projects/:projectId/disputes` | GET | List disputes for a project | 🔒 Authenticated (participants or ADMIN) | — | Path: `projectId` | **200** `{"success":true,"data":{"disputes":[...]}}` | **401** · **403** `"You are not authorized to view these disputes"` · **404** `"Project not found"` |

---

## 17. Notifications

| Field | Value |
|---|---|
| **Endpoint** | `/api/notifications` |
| **HTTP Method** | `GET` |
| **Purpose** | Get my recent notifications (project activity feed) |
| **Authentication** | 🔒 Authenticated (any role) |
| **Request body** | — |
| **Parameters** | Query: `limit` (int, default 15, min 1, max 50) — **schema-validated** |

**Successful response:**

```json
// 200 OK
{ "success": true, "data": { "notifications": [
  { "type": "...", "project": {"title": "..."}, "milestone": {"title": "..."},
    "user": {"name": "..."}, "message": "...", "createdAt": "..." } ] } }
```

**Error responses:** **400** query validation (`errors[]`, e.g. non-integer/out-of-range `limit`) · **401** auth errors · **500**

---

## 18. Uploads

| Field | Value |
|---|---|
| **Endpoint** | `/api/uploads/avatar` |
| **HTTP Method** | `POST` |
| **Purpose** | Upload a profile avatar image (save the returned URL via `PATCH /api/users/me`) |
| **Authentication** | 🔒 Authenticated (any role) |
| **Request body** | `multipart/form-data` — file field name **`avatar`** (required). Accepted types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` · max **5 MB** |
| **Parameters** | — |

**Successful response:**

```json
// 200 OK
{ "success": true, "message": "Avatar uploaded",
  "data": { "url": "http://localhost:5000/uploads/avatars/<userId>-<timestamp>.<ext>" } }
```

**Error responses:**

| Status | Message |
|---|---|
| 400 | `"No file was uploaded"` |
| 400 | `"Only JPEG, PNG, WEBP, or GIF images are allowed"` |
| 400 | `"File is too large (5MB max)"` |
| 401 | auth errors (§1) |

---

## 19. Rate Limiting

| Scope | Window | Limit | Error response |
|---|---|---|---|
| All `/api` routes | 15 min | 300 requests / IP | **429** standard headers, `{"success":false,...}` |
| `/api/auth/*` | 15 min | 20 requests / IP | **429** `{"success":false,"message":"Too many attempts. Please try again later."}` |

CORS: allowed origin `CLIENT_URL` (default `http://localhost:5173`), credentials enabled. Helmet security headers applied globally.

---

## 20. Postman Setup

1. **Create an environment** with these variables:

   | Variable | Initial value |
   |---|---|
   | `base_url` | `http://localhost:5000/api` |
   | `token` | *(empty — filled after login)* |

2. **Login first:** send `POST {{base_url}}/auth/login`, then in the `Tests` tab save the token:

   ```js
   const res = pm.response.json();
   if (res.data && res.data.token) pm.environment.set("token", res.data.token);
   ```

3. **Auth header for protected endpoints** (Authorization tab → Type: *Bearer Token*):

   ```
   {{token}}
   ```

4. **Common pre-request/test snippets:**

   ```js
   // Pretty-print and assert success (Tests tab)
   pm.test("Status is 2xx", () => pm.response.to.be.success);
   pm.expect(pm.response.json().success).to.eql(true);
   ```

5. **Upload request:** set body → *form-data*, key `avatar`, type *File*.

---

### Validation & error-handling notes

1. `GET /api/jobs` is **public by design** — the landing page fetches the job feed without a token (the route contains no `protect` middleware).
2. Zod `validate()` middleware checks the request **`req.body`** (default) and, with `validate(schema, "query")`, the **query string** of the list endpoints (`/jobs`, `/users`, `/users/admin/all`, `/notifications`, `/disputes`, `/auth/verify-email`). Query validation is reject-only — it never rewrites `req.query`, so services still parse the raw strings themselves.
3. **Path parameters** are schema-validated separately: every `:id` / `:jobId` / `:projectId` / `:milestoneId` / `:disputeId` route registers a Zod ObjectId check through `router.param`, returning `400 {"success":false,"message":"Invalid ID format"}` before the request reaches authentication or the database.
4. Operational failures (not-found, forbidden, wrong state, duplicates) are thrown as `AppError` with explicit **4xx** status codes — e.g. proposal accept, milestone submit/request-changes/approve, dispute open/resolve now return 400/403/404/409 instead of 500. Genuine unexpected errors still return 500.
5. `POST /api/payments/verify` returns a **flat** `data.payment` + `data.transaction` structure (matching the frontend's `PaymentVerification` type).
6. All formerly manual body validations are now Zod schemas wired through `validate()`: `payments/verify`, milestone `submit`/`request-changes`, review create, dispute open/resolve. Legacy error strings are preserved (e.g. `"Submission message is required"`, `"Rating must be between 1 and 5"`, `"Invalid dispute decision"`).
