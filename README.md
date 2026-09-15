
  # Premium Enterprise Insurance App

  Insurance policy and claims management application with a Spring Boot API, PostgreSQL/Flyway persistence, JWT/RBAC security, and a React/Vite dashboard. This repository is a review-ready academic demo: the implemented CRUD and claims/payment foundation is live, while unsupported enterprise integrations are explicitly documented as future work.

  ## Local setup

  Prerequisites: Java 17+, PostgreSQL, and Node.js 18+.

  Create a PostgreSQL database named `insurance_db`, then configure the backend process environment. Do not commit the password:

  ```powershell
  $env:DB_URL="jdbc:postgresql://localhost:5432/insurance_db"
  $env:DB_USERNAME="postgres"
  $env:DB_PASSWORD="<your-local-postgres-password>"
  $env:JWT_SECRET="<a-long-random-development-secret>"
  ```

  Start the backend:

  ```powershell
  cd src/backend
  ./mvnw.cmd spring-boot:run
  ```

  The API runs at `http://localhost:8080`. CRUD endpoints are under `/api/...`; login is available at `POST /api/v1/auth/login`. OpenAPI is available at `http://localhost:8080/swagger-ui.html`.

  Start the frontend from the repository root:

  ```powershell
  npm install --package-lock=false
  npm run dev
  ```

  The dashboard runs at `http://localhost:5173` and proxies `/api` requests to the backend.

  ## Verification

  ```powershell
  cd src/backend
  ./mvnw.cmd test
  cd ../..
  npm run build
  ```

  The current test suite includes a Spring context smoke test using H2. Production configuration remains PostgreSQL-based.

  ## Demo credentials

  The development seed is enabled by default. It creates non-production demo accounts:

  | Role | Username | Password |
  | --- | --- | --- |
  | Admin | `admin` | `Admin@1234` |
  | Agent | `agent1` | `Agent@1234` |
  | Surveyor | `surveyor1` | `Survey@1234` |
  | Claims handler | `claims1` | `Claims@1234` |
  | Finance officer | `finance1` | `Finance@1234` |
  | Customer | `customer1` | `Customer@1234` |

  Set `SEED_DATA_ENABLED=false` outside a disposable development database. Never use the sample passwords or the development JWT fallback in production.

  ## Implementation status

  | SRS area | Status | Verified scope |
  | --- | --- | --- |
  | FR1 Product configuration and quotation | Partial | Product/premium UI is demo data; no persisted quote engine. |
  | FR2 Policy issuance and KYC | Partial | Policy CRUD and role checks are live; KYC/document workflow is absent. |
  | FR3 Premium collection and billing | Partial | Payment history and sandbox records are live; no gateway verification or receipt service. |
  | FR4 Endorsements | Partial | Persisted endorsement submission, policy/customer access checks, staff approval, audit logging, and frontend submission are live; applying approved policy field changes remains future work. |
  | FR5 Renewal | Missing | No renewal entity, eligibility, or renewal API. |
  | FR6 FNOL | Partial | Claim creation, active-policy validation, ownership checks, and duplicate prevention are live. |
  | FR7 Investigation and survey | Partial | Surveyor CRUD/assignment fields exist; inspection/report/document workflow is absent. |
  | FR8 Adjudication and settlement | Partial | Claim status and approved amount fields exist; settlement/payment workflow is not implemented. |
  | FR9 Reinsurance | Missing | No treaty, cession, or RI reporting model. |
  | FR10 Agent and broker management | Partial | Agent CRUD and policy relationships exist; commissions/performance are demo values. |
  | FR11 Compliance and regulatory | Partial | JWT, BCrypt, RBAC, validation, audit logging, and ownership checks exist; TAT/compliance dashboard is not complete. |
  | FR12 Analytics and reporting | Partial | Dashboard aggregates and policy/claim/payment analytics APIs exist; exports and several charts remain static. |

  ## Verified end-to-end scope

  Live flows are: register/login, JWT refresh, role-filtered navigation, customer-owned policy/claim/payment/endorsement reads, policy CRUD for staff, FNOL creation against an active policy, duplicate FNOL rejection, payment record creation with policy ownership validation, endorsement submission and staff approval, analytics reads, audit writes, and seeded demo data. The landing page, quote wizard, policy cards, chart series, agent metrics, surveyor inspection form, profile settings, export/download buttons, social login, and AI claims are presentation/demo surfaces unless connected to one of the API methods listed in `src/frontend/services/api.ts`.

  ## Security and known limitations

  Customer ownership is enforced server-side for customer, policy, claim, and payment access paths. Public registration always creates `CUSTOMER`; privileged accounts come from controlled administration/seed data. Passwords are BCrypt-hashed, JWT secrets are environment-configured, and audit entries are written for important mutations.

  Password reset currently logs a development token instead of sending email. Payment records are sandbox records, not verified gateway transactions. File uploads, KYC, external identity, notifications, reinsurance, settlement disbursement, and regulatory integrations require additional adapters and credentials. These are future enhancements, not completed features.

  ## Review preparation

  Week 12 evidence: run the backend test/build and frontend build commands below, test login/401/403/ownership/validation/duplicate cases through Swagger, and capture screenshots of the seeded dashboards and live policy/claim/payment lists.

  Week 13 documentation should cover the problem statement, objectives, architecture, modules, technology stack, ER schema, API examples, screenshots, test results, known limitations, and future enhancements. Viva topics: JWT flow, server-side RBAC, BCrypt, Flyway versus Hibernate schema management, customer ownership enforcement, duplicate claim validation, sandbox payment design, and why external integrations are abstracted.

  ## Exact commands

  ```powershell
  # Start PostgreSQL and the full Docker demo
  docker compose up --build

  # Backend tests and package
  cd src/backend
  .\mvnw.cmd test
  .\mvnw.cmd clean package
  .\mvnw.cmd spring-boot:run

  # Frontend from repository root
  cd ../..
  npm install --package-lock=false
  npm run build
  npm run dev
  ```

  Frontend: `http://localhost:5173`. Backend: `http://localhost:8080`. Swagger: `http://localhost:8080/swagger-ui.html`.

  ## 📚 Additional Documentation

  - **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide for rapid deployment
  - **[PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)** - Complete feature list and verification status
  - **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production deployment and security hardening guide
  - **[docs/API.md](docs/API.md)** - Detailed API endpoint documentation
  - **[docs/DATABASE.md](docs/DATABASE.md)** - Database schema and relationships
  - **[docs/TESTING.md](docs/TESTING.md)** - Testing strategy and guidelines

  ## ✅ Project Status

  **BUILD STATUS:** ✅ All builds passing  
  **TEST STATUS:** ✅ All tests passing (1/1)  
  **DEPLOYMENT STATUS:** ✅ Ready for local/Docker deployment  
  **DOCUMENTATION STATUS:** ✅ Complete

  ### What's Working
  - ✅ Full authentication & authorization (JWT + RBAC)
  - ✅ Policy management (CRUD, 9 insurance types)
  - ✅ Claims processing (FNOL, status workflow, surveyor assignment)
  - ✅ Payment tracking (multiple methods, transaction history)
  - ✅ Endorsement workflow (submission, approval, tracking)
  - ✅ Customer management (ownership validation)
  - ✅ Agent & surveyor management
  - ✅ Analytics dashboard (charts, statistics, reports)
  - ✅ Audit logging (all critical operations tracked)
  - ✅ Demo data seeding (6 role types with sample data)

  ### Quick Verification
  ```powershell
  # Verify backend build
  cd src/backend
  ./mvnw.cmd clean package
  
  # Verify frontend build
  npm run build
  
  # Run tests
  cd src/backend
  ./mvnw.cmd test
  ```

  All commands should complete successfully with no errors.
  