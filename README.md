# OfficeFlow — Mini Office Management System

A full-stack application for managing employee records and leave requests: create, search, and filter employees; submit leave requests; and let administrators approve or reject them. Built per the plan in [`OfficeFlow_Roadmap.md`](./OfficeFlow_Roadmap.md).

## Architecture rationale

| Layer      | Choice                              | Why                                                                                                                    |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Frontend   | React + Vite                         | Component-based UI, fast dev server, no build-config boilerplate.                                                     |
| Styling    | Tailwind CSS v4                      | Utility classes made it fast to build the roadmap's specific visual direction (dark navy sidebar, blue actions, white cards) and keep responsive breakpoints consistent. |
| Routing    | React Router                         | Standard client-side routing for a 3-page app (Dashboard / Employees / Leaves).                                        |
| HTTP       | Axios                                | Simple request/response interceptors to normalize API errors into one shape the UI can render consistently.           |
| Charts     | Recharts                             | Lightweight React chart components for the dashboard's department/leave breakdowns.                                   |
| Backend    | Node.js + Express 5                  | Small REST API with explicit middleware and route boundaries; no framework magic to fight.                            |
| Database   | MongoDB (Atlas)                      | Document model fits employee/leave records well; no local DB server needed to develop against.                        |
| ODM        | Mongoose                             | Schema-level validation, timestamps, and `ObjectId` refs (`Leave.employee` → `Employee`) without hand-rolled plumbing. |
| Validation | Zod                                  | Declarative request validation (body/params/query) kept out of controllers, with clear error messages.                |
| Security   | Helmet, scoped CORS, rate limiting   | Baseline hardening appropriate for a small API: sane headers, origin allow-list, abuse throttling.                    |

Business rules (uniqueness checks, leave status-transition enforcement) live in the **service layer** (`server/src/services`), not in controllers or route handlers, per the roadmap's request-flow guidance.

### Request flow

```
React UI → Axios service → Express route → Zod validation middleware → Controller → Service → Mongoose model → MongoDB
```

## Data model

### Employee

| Field          | Type                  | Notes                      |
| -------------- | --------------------- | --------------------------- |
| `employeeCode` | String                | required, unique            |
| `name`         | String                | required                    |
| `email`        | String                | required, unique, validated |
| `phone`        | String                | optional                    |
| `department`   | String                | required                    |
| `designation`  | String                | required                    |
| `joiningDate`  | Date                  | required                    |
| `status`       | `ACTIVE` \| `INACTIVE`| default `ACTIVE`            |
| `createdAt` / `updatedAt` | Date       | automatic                   |

### Leave request

| Field         | Type                                    | Notes                                  |
| ------------- | ---------------------------------------- | --------------------------------------- |
| `employee`    | ObjectId → Employee                      | required                                |
| `leaveType`   | `casual` \| `sick` \| `annual`           | required                                |
| `startDate` / `endDate` | Date                           | required; `startDate` ≤ `endDate`       |
| `reason`      | String                                   | required                                |
| `status`      | `PENDING` \| `APPROVED` \| `REJECTED`    | default `PENDING`                       |
| `reviewedBy` / `reviewedAt` | String / Date              | set when reviewed                       |
| `createdAt` / `updatedAt` | Date                         | automatic                               |

**Relationship:** one employee has many leave requests. **Deletion policy:** deleting an employee cascades to delete their leave history (a simple, explicit policy chosen over soft-delete/archival for this app's scope — see `server/src/services/employee.service.js`).

## API

Base URL: `/api`. All responses use a consistent envelope:

```json
// success
{ "success": true, "data": { ... }, "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }

// error
{ "success": false, "message": "Employee not found", "code": "EMPLOYEE_NOT_FOUND" }
```

| Method   | Endpoint              | Purpose                                                      |
| -------- | --------------------- | -------------------------------------------------------------- |
| `POST`   | `/employees`           | Create an employee                                             |
| `GET`    | `/employees`           | List employees — `?search=&department=&status=&page=&limit=`  |
| `GET`    | `/employees/:id`       | Get one employee                                                |
| `PUT`    | `/employees/:id`       | Update an employee                                              |
| `DELETE` | `/employees/:id`       | Delete an employee (cascades leave history) → `204`             |
| `POST`   | `/leaves`               | Submit a leave request (always starts `PENDING`)                |
| `GET`    | `/leaves`               | List leave requests — `?status=&employeeId=&page=&limit=`       |
| `GET`    | `/leaves/:id`           | Get one leave request                                            |
| `PATCH`  | `/leaves/:id/status`    | Approve/reject a **pending** request — `{ "status": "APPROVED" \| "REJECTED" }` |
| `GET`    | `/stats/summary`        | Aggregate counts + breakdowns for the dashboard                 |
| `GET`    | `/health`               | Health check (outside `/api`)                                   |

### HTTP status conventions

`200` read/update · `201` created · `204` deleted · `400` validation/malformed input · `404` not found · `409` duplicate email/code or invalid leave status transition · `500` unexpected error (no internals leaked).

## Environment variables

**`server/.env`** (copy from `server/.env.example`):

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/officeflow?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

**`client/.env`** (copy from `client/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

## Running locally

```bash
# 1. Server
cd server
npm install
cp .env.example .env   # then fill in MONGODB_URI
npm run dev             # http://localhost:5000

# 2. Client (separate terminal)
cd client
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

## Known limitations / deferred (per roadmap's "after core" list)

- No authentication/RBAC yet — anyone can review leave requests; `reviewedBy` is client-supplied rather than derived from a logged-in reviewer.
- No automated test suite yet.
- No Docker setup or deployment.
- No dark-mode toggle.
- Dashboard numbers come from live aggregate queries on every load rather than cached/materialized stats — fine at this data scale, would need revisiting at larger scale.
