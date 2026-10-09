# Mini Office Management System

A production-minded office management application for managing employee records and leave requests.

## 1. Project Goals

Build a responsive, reliable application that implements these two core features:

- **Employee Management:** create, view, update, delete, search, and filter employee records.
- **Leave Management:** submit leave requests and let administrators review, approve, or reject them.

The priority is correctness and polish over feature count. Complete the required workflows before investing time in optional enhancements.

## 2. Recommended Technology Stack

| Layer      | Technology              | Rationale                                             |
| ---------- | ----------------------- | ----------------------------------------------------- |
| Frontend   | React                   | Component-based UI with useful compile-time checks    |
| Styling    | Tailwind CSS            | Fast, consistent, responsive styling                  |
| Backend    | Node.js + Express       | Familiar REST API architecture and middleware support |
| Database   | MongoDB                 | NoSQL database                                        |
| Charts     | Recharts                | Simple dashboard visualizations                       |
| Deployment | Vercel + Render/Railway | Straightforward deployment options                    |

## 3. Scope and Priorities

### Must-have

- Employee CRUD
- Employee search and department/status filters
- Leave request submission
- Pending / Approved / Rejected workflow
- Administrative review actions
- Server-side input validation
- Consistent HTTP status codes and error responses
- Defensive error handling
- Responsive desktop and mobile UI
- `.env.example`, `.gitignore`, and setup instructions
- README documenting architecture and technology choices

### Good enhancements, after the core is complete

1. Analytics dashboard
2. Authentication and role-based access control (RBAC)
3. Unit and integration tests
4. Deployment
5. Docker
6. Dark mode

## 4. Suggested Folder Structure

```text
officeflow/
├── client/
│   └── src/
│       ├── components/
│       ├── features/
│       │   ├── employees/
│       │   ├── leaves/
│       │   └── dashboard/
│       ├── layouts/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── App.jsx
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       └── app.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Request flow

```text
React UI
   ↓
API service /
   ↓
Express route
   ↓
Validation middleware
   ↓
Controller
   ↓
Service layer
   ↓
MongoDB
```

Keep business rules in the service layer rather than scattering them across route handlers and UI components.

## 5. Data Model

Use a NoSQL database.

### Employee

Suggested fields:

- `id`: generated primary key
- `employeeCode`: unique employee identifier
- `name`: required
- `email`: required and unique
- `phone`: optional or required according to the form requirements
- `department`: required
- `designation`: required
- `joiningDate`: required date
- `status`: `ACTIVE` or `INACTIVE`
- `createdAt`, `updatedAt`: timestamps

### Leave Request

Suggested fields:

- `id`: generated primary key
- `employeeId`: foreign key to Employee
- `leaveType`: e.g. casual, sick, or annual
- `startDate`, `endDate`: dates
- `reason`: required text
- `status`: `PENDING`, `APPROVED`, or `REJECTED`
- `reviewedBy`: optional reviewer ID, if users/admins are implemented
- `reviewedAt`: optional timestamp
- `createdAt`, `updatedAt`: timestamps

**Relationship:** one employee can have many leave requests. Use a foreign-key constraint. Decide whether employee deletion should be restricted, soft-deleted, or handled with an explicit archival policy so historical leave records are not accidentally lost.

## 6. API Plan

Use a consistent `/` prefix.

### Employees

| Method   | Endpoint         | Purpose                                      |
| -------- | ---------------- | -------------------------------------------- |
| `POST`   | `/employees`     | Create an employee                           |
| `GET`    | `/employees`     | List, search, filter, and paginate employees |
| `GET`    | `/employees/:id` | Get one employee                             |
| `PUT`    | `/employees/:id` | Update an employee                           |
| `DELETE` | `/employees/:id` | Delete or archive an employee                |

Example list query:

```http
GET /employees?search=rahul&department=Engineering&status=ACTIVE&page=1&limit=10
```

### Leave requests

| Method  | Endpoint             | Purpose                             |
| ------- | -------------------- | ----------------------------------- |
| `POST`  | `/leaves`            | Submit a leave request              |
| `GET`   | `/leaves`            | List requests, with filters         |
| `GET`   | `/leaves/:id`        | Get one request                     |
| `PATCH` | `/leaves/:id/status` | Approve or reject a pending request |

When authentication is added, scope employee access to their own requests and restrict approval/rejection to authorized administrators. Do not trust a client-provided role or reviewer ID.

### HTTP status conventions

- `200 OK`: successful read or update
- `201 Created`: resource created
- `204 No Content`: successful deletion with no response body
- `400 Bad Request`: malformed request or invalid query parameters
- `401 Unauthorized`: authentication is missing or invalid
- `403 Forbidden`: authenticated user lacks permission
- `404 Not Found`: resource does not exist
- `409 Conflict`: duplicate employee code/email or conflicting state
- `422 Unprocessable Entity`: optional convention for semantically invalid input; use consistently
- `500 Internal Server Error`: unexpected server failure

Choose a consistent validation-error convention (`400` or `422`) and document it.

## 7. Validation and Business Rules

Validate input on the server even if the frontend also validates it.

### Employee rules

- Trim strings and reject required fields that are empty.
- Validate email format.
- Enforce unique employee code and email in the database.
- Validate status against the allowed values.
- Validate dates and reject invalid date formats.
- Limit string lengths and reject unexpected fields where appropriate.

### Leave rules

- `startDate` must not be after `endDate`.
- `status` must be one of the allowed enum values.
- New requests start as `PENDING`; clients must not submit an already-approved request.
- Only pending requests can be approved or rejected unless the product explicitly defines a different workflow.
- Prevent unauthorized users from reviewing requests.
- Consider preventing overlapping approved leave requests for the same employee if this fits the intended business rules.

Use database constraints as a final line of defense for uniqueness and relationships.

## 8. Error Handling and Security

- Add a centralized Express error-handling middleware.
- Return a consistent response shape, for example:

```json
{
  "success": false,
  "message": "Employee not found",
  "code": "EMPLOYEE_NOT_FOUND"
}
```

- Do not expose stack traces, SQL details, credentials, or internal error messages in production responses.
- Store secrets in environment variables; never commit `.env`.
- Commit `.env.example` with placeholder values only.
- Add `.env`, `node_modules/`, build outputs, and local logs to `.gitignore`.
- Use Helmet and configure CORS for the actual frontend origin.
- Add rate limiting where appropriate.
- Use parameterized queries/ORM APIs; never build SQL from untrusted strings.
- If authentication is added, use a well-supported authentication approach, secure session/token handling, password hashing when managing passwords, and server-side authorization checks.
- Use HTTPS in deployment and apply database least-privilege principles.

## 9. UI/UX Plan

Use the generated OfficeFlow mockup as a visual direction: a clean, modern admin interface with a dark navy sidebar, blue primary actions, white cards, subtle borders, and readable typography.

### Main navigation

- Dashboard
- Employees
- Leave Requests
- Settings (optional)

### Dashboard

- Total employees
- Active employees
- Pending leave requests
- Approved leave requests
- Employees by department chart
- Leave status chart

### Employee management

- Table with ID, name, email, department, designation, joining date, status, and actions
- Search by name, email, or employee ID
- Department and status filters
- Pagination
- Add, view, edit, and delete/archive actions
- Confirmation dialog before destructive actions

### Leave management

- Tabs or filters for All, Pending, Approved, and Rejected
- Employee, leave type, date, and status filters
- Leave detail view with reason and dates
- Approve/reject actions for authorized reviewers
- Confirmation and success/error feedback

### Forms and states

Every page should account for:

- Loading state
- Empty state
- Validation errors
- API/server errors with retry where appropriate
- Success feedback
- Disabled/loading submit buttons to prevent duplicate submissions

### Responsive behavior

- Desktop: sidebar and full tables
- Tablet: compact navigation and reduced table columns
- Mobile: collapsible navigation and stacked employee/request cards or carefully designed horizontal scrolling

Check layouts at approximately 1440px, 1024px, 768px, and 375px widths.

## 10. Implementation Roadmap

### Phase 1 — Setup

- [ ] Create repository and client/server structure.
- [ ] Configure TypeScript, linting, formatting, and environment variables.
- [ ] Set up PostgreSQL and Prisma.
- [ ] Create the first database migration.
- [ ] Add a health-check endpoint.

**Done when:** the app starts locally and can connect to the database.

### Phase 2 — Employee API

- [ ] Create employee schema and validation.
- [ ] Implement create, list, detail, update, and delete/archive endpoints.
- [ ] Add search, filters, and pagination.
- [ ] Handle duplicate email/code and missing records.
- [ ] Standardize API responses and errors.

**Done when:** employee workflows can be exercised through an API client without the frontend.

### Phase 3 — Employee UI

- [ ] Build app layout and navigation.
- [ ] Build employee list, search, filters, and pagination.
- [ ] Build reusable create/edit form.
- [ ] Add detail view and delete confirmation.
- [ ] Add loading, empty, success, and error states.

**Done when:** an employee can be created, found, edited, and deleted/archived through the UI.

### Phase 4 — Leave API and workflow

- [ ] Create leave schema and validation.
- [ ] Implement request submission and list/detail endpoints.
- [ ] Implement approve/reject endpoint.
- [ ] Enforce allowed status transitions on the server.
- [ ] Add filtering by status, employee, and dates.

**Done when:** requests can be submitted and reviewed, and invalid transitions are rejected.

### Phase 5 — Leave UI

- [ ] Build leave submission form.
- [ ] Build leave history and status filters.
- [ ] Build review view with approve/reject actions.
- [ ] Display status badges and feedback.
- [ ] Verify validation and authorization behavior.

**Done when:** the complete leave workflow works end to end.

### Phase 6 — Analytics dashboard

- [ ] Add employee and leave summary endpoints or efficient aggregate queries.
- [ ] Display totals and status breakdowns.
- [ ] Add department and leave charts.
- [ ] Ensure counts come from real database data, not hardcoded mock values.

**Done when:** dashboard numbers match the underlying records.

### Phase 7 — Production-minded polish

- [ ] Review input validation and HTTP status codes.
- [ ] Check all empty, loading, error, and success states.
- [ ] Check responsive behavior on desktop and mobile.
- [ ] Add automated tests for critical flows.
- [ ] Confirm no secrets are committed.
- [ ] Add a clear `.env.example`.
- [ ] Write the README and local setup instructions.
- [ ] Optionally deploy and verify the deployed application.

## 11. Testing Checklist

### Employee management

- [ ] Create an employee with valid input.
- [ ] Reject missing or malformed fields.
- [ ] Reject duplicate email and employee code.
- [ ] Read an existing employee.
- [ ] Return `404` for a missing employee.
- [ ] Update employee fields.
- [ ] Delete/archive an employee safely.
- [ ] Search and combine filters.
- [ ] Validate pagination parameters.

### Leave management

- [ ] Submit a valid leave request.
- [ ] Reject invalid dates and missing reasons.
- [ ] Verify new requests start as pending.
- [ ] Approve a pending request.
- [ ] Reject a pending request.
- [ ] Reject invalid status values.
- [ ] Reject a repeated or invalid status transition.
- [ ] Verify employee/request relationships.
- [ ] Verify authorization if login/RBAC is implemented.

### Reliability and security

- [ ] Test database/API failures.
- [ ] Confirm errors do not reveal stack traces or secrets.
- [ ] Confirm protected actions require the correct role.
- [ ] Confirm environment variables are documented but not committed.
- [ ] Confirm mobile layouts remain usable.

## 12. README Architecture Rationale

Document the reasoning behind the stack, not just a list of tools. For example:

- **React + TypeScript:** reusable interface components and better type checking.
- **Express:** a small REST API with explicit middleware and route boundaries.
- **PostgreSQL:** relational integrity for employees and their leave requests.
- **Prisma:** type-safe data access and versioned schema migrations.
- **Zod:** clear server-side input validation.
- **Tailwind CSS:** consistent design tokens and responsive layouts.
- **TanStack Query:** predictable API loading, caching, and mutation states.

Also document:

- Features and screenshots
- Architecture overview
- Data model
- API endpoints and response conventions
- Environment variables
- Installation and development commands
- Database migration/seed commands
- Tests
- Deployment URL, if available
- Known limitations and future improvements

## 13. Suggested Time Allocation

For a short coding assessment, a reasonable allocation is:

| Work                                 | Approximate share |
| ------------------------------------ | ----------------: |
| Setup and data model                 |               10% |
| Employee management                  |               25% |
| Leave management                     |               25% |
| Validation, error handling, security |               15% |
| UI polish and responsiveness         |               10% |
| Testing and README                   |               15% |

Adjust to the actual deadline. If time is tight, finish two required features before building optional enhancements.

## Final Definition of Done

- [ ] At least two core features work end to end.
- [ ] Data persists in a database.
- [ ] Server-side validation and defensive error handling are implemented.
- [ ] HTTP status codes and API response shapes are consistent.
- [ ] Secrets are not committed.
- [ ] Desktop and mobile layouts are usable.
- [ ] README explains the architecture and how to run the project.
- [ ] Critical workflows have been manually or automatically tested.
