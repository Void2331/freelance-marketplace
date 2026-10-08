# Freelance Marketplace

A full-stack freelance marketplace platform where clients can post jobs, freelancers can submit proposals, and projects can move through defined milestones from proposal acceptance to completion.

The application is being built with a **React + TypeScript frontend** and a **Node.js + Express + MongoDB backend**, with authentication, role-based authorization, job management, proposals, projects, milestones, payments, wallets, reviews, and administrative functionality.

---

## 🚀 Project Overview

The Freelance Marketplace allows three types of users to interact with the platform:

- **CLIENT** — Posts jobs, reviews proposals, accepts freelancers, and manages projects.
- **FREELANCER** — Finds jobs, submits proposals, works on accepted projects, and manages earnings.
- **ADMIN** — Manages users, jobs, projects, and disputes.

### Core workflow

```text
Client
   │
   ├── Creates Job
   │
   ▼
Job Posted
   │
   ▼
Freelancers
   │
   ├── Submit Proposals
   │
   ▼
Client Reviews Proposals
   │
   ├── Accepts Proposal
   │
   ▼
Project / Contract Created
   │
   ▼
Milestones
   │
   ├── Work
   ├── Payment
   └── Release
   │
   ▼
Project Completed
```

---

# ✨ Features

## Authentication & Authorization

The application includes a complete authentication system with:

- User registration
- Email validation
- Email verification
- Verification-token expiration
- Resend verification email
- Login
- JWT authentication
- Protected routes
- Role-based authorization
- Forgot password
- Reset password
- Active/inactive user accounts
- Password hashing with bcrypt
- Authentication persistence through local storage

### User roles

The application intentionally uses three roles:

```text
ADMIN
CLIENT
FREELANCER
```

Public registration cannot create an administrator account.

---

# 👤 User Profiles

Authenticated users can manage their profile information.

Profile fields include:

- Name
- Avatar
- Bio
- Location
- Skills
- Hourly rate
- Role
- Account status
- Email verification status
- Ratings
- Review count

The profile settings page communicates with:

```http
PATCH /api/users/me
```

The backend validates and persists profile changes through MongoDB.

Freelancers can also be displayed in a public freelancer directory with filtering and search functionality.

---

# 💼 Jobs

Clients can create and manage jobs.

Job functionality includes:

- Creating jobs
- Viewing jobs
- Updating jobs
- Viewing job details
- Job status management
- Browsing available jobs
- Searching/filtering jobs
- Viewing proposals associated with a job

Jobs form the starting point of the marketplace workflow.

---

# 📩 Proposals

Freelancers can submit proposals for jobs posted by clients.

Proposal functionality includes:

- Creating proposals
- Viewing submitted proposals
- Viewing proposals for a job
- Accepting proposals
- Rejecting proposals
- Managing freelancer proposals

When a client accepts a proposal, the application begins the project creation workflow.

---

# 📁 Projects & Contracts

When a proposal is accepted, the backend can create the associated project workflow.

The acceptance process is designed to:

1. Accept the selected proposal.
2. Reject other pending proposals.
3. Move the job to `IN_PROGRESS`.
4. Create a project.
5. Create a contract.
6. Create milestones.
7. Create a payment record.
8. Generate a payment reference.
9. Record project activity.

The project includes a dedicated workroom interface.

Example route:

```text
/projects/:id
```

---

# 🎯 Milestones

Projects are organized around milestones.

Milestones can progress through different states, including:

```text
PENDING
IN_PROGRESS
SUBMITTED
APPROVED
RELEASED
```

The milestone/payment workflow is designed so that released milestones can contribute toward project completion.

---

# 💳 Payments

The application is designed to use **Paystack** for payments.

The payment architecture includes:

- Paystack initialization
- Payment references
- Payment verification
- Payment records
- Client platform fees
- Freelancer platform fees
- Payment status tracking
- Webhook-based payment confirmation

Platform fees are configurable through environment variables:

```env
PLATFORM_CLIENT_FEE_PERCENT=5
PLATFORM_FREELANCER_FEE_PERCENT=5
```

Payments are associated with projects and milestones.

The application also includes a payment callback route:

```text
/payment/callback
```

The backend is designed to treat the payment webhook as the authoritative source for successful payment confirmation rather than trusting only the frontend callback.

---

# 💰 Freelancer Wallet

Freelancers have a wallet system designed to track earnings.

The wallet architecture supports:

- Pending balance
- Available balance
- Released milestone earnings
- Payment-related transactions

Freelancers have a dedicated wallet page:

```text
/freelancer/wallet
```

---

# ⭐ Reviews & Ratings

The application includes a review system.

Users can have:

- Average ratings
- Review counts
- Public reviews

Reviews can be associated with projects and display information about the reviewer.

Freelancer profiles can therefore expose their reputation through ratings and reviews.

---

# 🛡️ Admin Features

Administrators have a dedicated administration area.

Admin functionality currently includes pages for:

```text
/admin/dashboard
/admin/users
/admin/jobs
/admin/projects
/admin/disputes
```

Administrators can manage users and account status.

For example:

```http
PATCH /api/users/:id/status
```

Administrators cannot deactivate their own account, and administrator accounts cannot be deactivated through the standard user-status workflow.

---

# 🖥️ Frontend

The frontend is built with:

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Base UI
- Lucide Icons
- Recharts
- Sonner

### Frontend architecture

The frontend is organized into areas such as:

```text
src/
├── components/
├── features/
├── hooks/
├── lib/
├── pages/
├── routes/
├── services/
├── types/
└── App.tsx
```

The application uses reusable components, API services, custom hooks, validation schemas, and typed models.

---

# 🔐 Frontend Authentication

Authentication state is maintained through an authentication context.

The frontend stores:

```text
accessToken
user
```

in local storage.

Axios automatically attaches the JWT to authenticated API requests:

```http
Authorization: Bearer <token>
```

The application also has an Axios response interceptor that handles unauthorized requests and redirects users to the login page when necessary.

---

# 🧭 Routing

The application uses React Router.

Public routes include:

```text
/
 /jobs
 /jobs/:id
 /freelancers
 /freelancers/:id

/login
/register
/verify-email
/forgot-password
/reset-password
```

Authenticated routes include:

```text
/dashboard
/projects/:id
/settings/profile
/payment/callback
```

### Client routes

```text
/client/dashboard
/client/jobs
/client/jobs/new
/client/jobs/:id/edit
/client/jobs/:id
/client/jobs/:jobId/proposals
/client/proposals
/client/projects
```

### Freelancer routes

```text
/freelancer/dashboard
/freelancer/jobs
/freelancer/jobs/:id
/freelancer/proposals
/freelancer/projects
/freelancer/wallet
```

### Admin routes

```text
/admin/dashboard
/admin/users
/admin/jobs
/admin/projects
/admin/disputes
```

Protected routes are separated using:

- `ProtectedRoute`
- `RoleRoute`

This prevents unauthenticated users from accessing authenticated areas and restricts role-specific pages.

---

# 🔌 Backend

The backend is built with:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Nodemailer
- Helmet
- CORS
- Express Rate Limit

The backend follows a layered structure separating:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
```

Validation and middleware are also separated from business logic.

---

# 📡 REST API

The backend exposes RESTful API endpoints.

The API base URL during development is:

```text
http://localhost:5000/api
```

Examples include:

```http
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

PATCH  /api/users/me
GET    /api/users
GET    /api/users/:id
GET    /api/users/:id/reviews
PATCH  /api/users/:id/status
```

Additional endpoints exist for jobs, proposals, projects, milestones, payments, reviews, and administration.

---

# 🧪 Validation

The application uses **Zod** for request validation.

Examples of validation include:

### Registration

- Name length
- Email format
- Password length
- Password complexity
- Required fields

Passwords must contain:

- At least 8 characters
- Uppercase character
- Lowercase character
- Number

### Profile

Profile updates validate fields such as:

- Name
- Avatar URL
- Bio
- Location
- Skills
- Hourly rate

Invalid requests are rejected before reaching the service layer.

---

# 🔒 Security

Several security measures have been implemented.

### Password security

Passwords are hashed using:

```text
bcryptjs
```

Plain-text passwords are never stored in the database.

### JWT authentication

Authenticated requests use JWT bearer tokens:

```http
Authorization: Bearer <token>
```

### HTTP security headers

The backend uses:

```text
Helmet
```

for security-related HTTP headers.

### CORS

The API restricts frontend access through the configured client URL.

Development example:

```env
CLIENT_URL=http://localhost:5173
```

### Rate limiting

API requests are protected with rate limiting to reduce abuse.

### Input validation

Incoming request data is validated with Zod before being processed.

### Role authorization

Sensitive operations are restricted based on user roles.

---

# 📧 Email Verification

New accounts are required to verify their email address before login.

The workflow is:

```text
Register
   ↓
Verification Token Generated
   ↓
Verification Email Sent
   ↓
User Opens Link
   ↓
Email Verified
   ↓
User Can Login
```

Verification tokens are hashed before being stored and expire after a limited period.

---

# 🗄️ Database

The application uses MongoDB with Mongoose.

Major domain models include concepts such as:

```text
User
Job
Proposal
Project
Contract
Milestone
Payment
Review
Wallet
Activity
```

Relationships between these models allow the platform to connect:

```text
User
 ↓
Job
 ↓
Proposal
 ↓
Project
 ↓
Contract
 ↓
Milestone
 ↓
Payment
```

---

# 🛠️ Environment Variables

The backend uses environment variables for configuration.

Example:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_HOST=your_email_host
EMAIL_PORT=465
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email_address

PLATFORM_CLIENT_FEE_PERCENT=5
PLATFORM_FREELANCER_FEE_PERCENT=5

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

The frontend uses:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real credentials or secret keys to Git.

---

# ▶️ Running the Project Locally

## 1. Clone the repository

```bash
git clone https://github.com/josnach/freelance-marketplace.git
cd freelance-marketplace
```

---

## 2. Backend setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

## 3. Frontend setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 📦 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI | shadcn/ui + Base UI |
| Routing | React Router |
| Server State | TanStack Query |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Validation | Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Backend | Node.js |
| API Framework | Express |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| Email | Nodemailer |
| Payments | Paystack |
| Security | Helmet + Rate Limiting |
| API Validation | Zod |

---

# 📊 Current Project Status

The project has progressed beyond the initial setup stage and has a working full-stack architecture.

### Completed / implemented

- [x] React + TypeScript frontend
- [x] Vite configuration
- [x] Node.js + Express backend
- [x] MongoDB/Mongoose integration
- [x] User registration
- [x] Login
- [x] JWT authentication
- [x] Email verification
- [x] Forgot/reset password workflow
- [x] Three-role authorization system
- [x] Protected routes
- [x] Role-specific routes
- [x] User profile management
- [x] Client dashboard
- [x] Freelancer dashboard
- [x] Admin dashboard
- [x] Job management
- [x] Proposal management
- [x] Project workflow
- [x] Contract workflow
- [x] Milestones
- [x] Payment architecture
- [x] Paystack integration architecture
- [x] Freelancer wallet architecture
- [x] Reviews and ratings
- [x] Admin user management
- [x] API validation
- [x] API error handling
- [x] CORS configuration
- [x] Helmet security headers
- [x] API rate limiting
- [x] Axios authentication interceptor
- [x] React Query API hooks
- [x] Profile settings
- [x] Responsive UI structure

### 🚧 Still being developed

Some areas are still being refined, tested, or expanded, including:

- [ ] Final UI/UX polish
- [ ] Complete messaging system
- [ ] Complete notification system
- [ ] Additional frontend/backend testing
- [ ] Production deployment
- [ ] Production environment configuration
- [ ] Complete API documentation
- [ ] Additional payment edge-case handling
- [ ] Final integration testing
- [ ] Final accessibility and responsive testing

---

# 🧱 Project Architecture

At a high level, the system follows this architecture:

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │   TypeScript/Vite   │
                    └──────────┬──────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express API       │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        Controllers        Middleware         Services
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Mongoose       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    └─────────────────────┘
```

External services:

```text
             ┌──────────────┐
             │   Paystack   │
             └──────┬───────┘
                    │
                    ▼
             Payment System


             ┌──────────────┐
             │   Nodemailer │
             └──────┬───────┘
                    │
                    ▼
             Email Verification
```

---

# 🎯 Project Goal

The ultimate goal is to provide a complete freelance marketplace where:

### Clients

Can:

- Create jobs
- Receive proposals
- Evaluate freelancers
- Accept proposals
- Fund projects
- Manage milestones
- Review completed work

### Freelancers

Can:

- Create professional profiles
- Browse available jobs
- Submit proposals
- Manage projects
- Complete milestones
- Receive payments
- Manage wallet earnings
- Build ratings and reviews

### Administrators

Can:

- Manage platform users
- Manage jobs
- Monitor projects
- Handle disputes
- Maintain platform integrity

---

# 📌 Development Philosophy

The project is being developed with a focus on:

- Clean architecture
- Separation of concerns
- Type safety
- Reusable components
- API validation
- Secure authentication
- Role-based authorization
- Maintainable code
- Responsive design
- Scalable backend architecture
- Proper error handling

---

# 👨‍💻 Author

**Ezemsinachi Joshua Ihediwa**

Full-Stack Developer

Built with:

```text
React + TypeScript
Node.js + Express
MongoDB + Mongoose
```

---

# 📄 License

This project is currently intended as a learning/development project.

License information can be added when the project is prepared for public distribution.
## Maintainers
* **Void2331**
* **josnach**
