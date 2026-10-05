# Capy-Happy-Family — Architecture

## 1. Architecture Overview

Capy-Happy-Family uses a layered web application architecture.

The system is divided into:

1. Web frontend
2. Backend API
3. Business logic
4. Database access
5. MySQL database
6. External services

High-level structure:

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │   React Web App │
                  │   TypeScript    │
                  │   Vite          │
                  └────────┬────────┘
                           │
                       HTTPS / API
                           │
                           ▼
                  ┌─────────────────┐
                  │   Express API   │
                  │   TypeScript    │
                  └────────┬────────┘
                           │
                    Business Logic
                           │
                           ▼
                  ┌─────────────────┐
                  │  Prisma ORM     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │      MySQL      │
                  └─────────────────┘
```

2. Monorepo Structure
   The project will use a monorepo structure.
   capy-happy-family/
   │
   ├── apps/
   │ ├── web/
   │ │ └── React frontend
   │ │
   │ └── api/
   │ └── Express backend
   │
   ├── packages/
   │ ├── shared/
   │ ├── validation/
   │ └── config/
   │
   ├── docs/
   │ ├── product-spec.md
   │ └── architecture.md
   │
   ├── .github/
   │ └── workflows/
   │
   ├── .env.example
   ├── .gitignore
   ├── package.json
   └── README.md

apps/web
Contains the React application.
Responsibilities include:

- user interface
- routing
- forms
- client-side state
- API communication
- loading states
- error states
- responsive layouts
- accessibility
- animations
- Capy presentation
  The frontend must not contain sensitive business rules that require server-side enforcement.
  apps/api
  Contains the Express API.
  Responsibilities include:
- authentication
- authorization
- business rules
- validation
- database operations
- family isolation
- financial rules
- approval rules
- election rules
- audit logging
- file upload validation
- API error handling
  The backend is the final authority for permissions.
  packages/shared
  Contains code that is intentionally shared between applications.
  Potential examples:
- TypeScript types
- enums
- shared constants
- API contracts
  Only genuinely shared code should live here.
  packages/validation
  Contains reusable validation schemas.
  Zod will be used for validation.
  Examples:
- registration input
- login input
- task input
- expense input
- goal input
- family invitation input
- election input
  packages/config
  Contains shared configuration utilities.
  Environment-specific secrets must not be stored in source code.

3. Frontend Architecture
   The frontend uses:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Motion
- Lucide
  The frontend will be organized around features rather than creating one enormous components folder.
  Example:
  apps/web/src/

├── app/
│ ├── router/
│ ├── providers/
│ └── layouts/
│
├── features/
│ ├── auth/
│ ├── dashboard/
│ ├── family/
│ ├── tasks/
│ ├── calendar/
│ ├── finances/
│ ├── goals/
│ ├── dreams/
│ ├── recipes/
│ ├── shopping/
│ ├── achievements/
│ ├── chat/
│ ├── notifications/
│ └── capy/
│
├── components/
│ ├── ui/
│ └── shared/
│
├── lib/
│ ├── api/
│ ├── utils/
│ └── constants/
│
├── hooks/
│
├── styles/
│
└── main.tsx

The exact structure may evolve as the application grows. 4. UI Architecture
The interface will use a design system rather than individually styling every screen.
The design system will define:

- colors
- typography
- spacing
- borders
- radii
- shadows
- glass effects
- buttons
- inputs
- cards
- dialogs
- dropdowns
- navigation
- tables
- badges
- progress indicators
- notifications
  The design should remain visually consistent across all modules.

5. Visual Design Architecture
   The visual language is based on:

- restrained glassmorphism
- warm cream surfaces
- soft blue
- soft lavender
- sage
- cocoa typography
- monochrome line icons
- generous whitespace
- subtle borders
- subtle shadows
  Primary colors:
  Soft Blue #DDEEFE
  Soft Lavender #DDD6F0
  Cocoa #452E2B
  Warm Cream #FAEBDB
  Sage #B2C8B8

Colors will eventually be represented as semantic design tokens.
Components should use semantic tokens instead of hard-coded hex values.
Example:
--color-background
--color-surface
--color-surface-muted
--color-text
--color-text-muted
--color-primary
--color-success
--color-warning
--color-danger

6. Backend Architecture
   The backend uses:

- Node.js
- Express
- TypeScript
- Zod
- Prisma ORM
- MySQL
  The backend should use a layered architecture.
  HTTP Request
  │
  ▼
  Controller
  │
  ▼
  Validation
  │
  ▼
  Authorization
  │
  ▼
  Service
  │
  ▼
  Repository / Prisma
  │
  ▼
  Database

Controller
Responsible for:

- receiving HTTP requests
- extracting request data
- calling application services
- returning HTTP responses
  Controllers should remain thin.
  Validation
  Input should be validated before business logic executes.
  Example:
  HTTP request
  ↓
  Zod schema
  ↓
  Valid?
  / \
   No Yes
  ↓ ↓
  400 Service

Authorization
Authorization checks determine whether the authenticated user is allowed to perform an operation.
Examples:
Can this user access this family?

Can this user edit this expense?

Can this user approve this expense?

Can this user change this member's permissions?

Authorization must be performed on the backend.
Service Layer
Services contain business logic.
Examples:
TaskService
FinanceService
GoalService
ElectionService
ApprovalService
FamilyService
CapyService

Services should not depend directly on HTTP-specific details.
Database Layer
Prisma will be responsible for communication with MySQL.
The application should not construct raw SQL unnecessarily.
Database access should be centralized and predictable. 7. Database Architecture
MySQL is the primary relational database.
Prisma ORM provides:

- schema definition
- migrations
- typed database access
- relationships
- transactions
- query abstraction
  The database will contain major domains such as:
  User
  Family
  FamilyMember
  Role
  Permission
  Task
  TaskOccurrence
  CalendarEvent
  Account
  Transaction
  Budget
  Goal
  GoalContribution
  Dream
  Recipe
  ShoppingItem
  Achievement
  Challenge
  Gift
  Announcement
  ChatMessage
  Notification
  AuditLog
  Election
  Vote
  ApprovalRequest

The final schema will be designed carefully before implementation. 8. Multi-Tenant Family Isolation
Families represent logical tenants within the application.
A family-owned resource must contain a reliable relationship to its family.
Example:
Family
│
├── Members
├── Tasks
├── Transactions
├── Goals
├── Recipes
└── Shopping Items

When accessing a family resource, the backend must verify:

1.  the user is authenticated
2.  the user belongs to the relevant family
3.  the user has permission for the requested operation
    Example:
    GET /api/families/:familyId/expenses

            ↓

Authenticated?
↓
yes
↓
Member of family?
↓
yes
↓
Has permission?
↓
yes
↓
Return data

A frontend route or hidden UI element must never be treated as a security boundary. 9. Authentication
Authentication establishes who the user is.
The initial system will support:

- registration
- login
- logout
- secure session management
- password hashing
- password reset
- email verification
  Authentication and authorization are separate concepts.
  Authentication asks:
  Who are you?

Authorization asks:
What are you allowed to do?

10. Authorization
    Authorization will use roles and permissions.
    A permission may look conceptually like:
    finance.read
    finance.create
    finance.approve
    family.members.manage
    family.settings.manage
    goals.create
    chat.moderate

The exact permission list will be designed later.
The backend should use centralized authorization logic rather than duplicating permission checks throughout controllers. 11. Family Leadership Architecture
Family leadership consists of:
Election
│
▼
Votes
│
▼
Winner
│
▼
Leadership Term
│
▼
Leader Permissions
│
▼
Approval Rules

Important election data may include:

- election
- candidates
- eligible voters
- votes
- result
- start date
- end date
- leadership term
  Votes should not expose a voter's choice to ordinary family members.

12. Approval System
    Sensitive family actions may create an ApprovalRequest.
    Example:
    Member
    │
    ▼
    Create request
    │
    ▼
    ApprovalRequest
    │
    ▼
    Leader
    │
    ├── Approve
    │
    └── Reject

Approval rules may determine whether an action:

- requires no approval
- requires leader approval
- requires additional family participation
  Approval decisions should be recorded.

13. Audit Logging
    Important actions should produce an AuditLog.
    Examples:
    USER_LOGIN
    EXPENSE_CREATED
    EXPENSE_APPROVED
    EXPENSE_REJECTED
    MEMBER_INVITED
    MEMBER_PERMISSION_CHANGED
    LEADER_ELECTED
    LEADER_CHANGED
    GOAL_CREATED
    FAMILY_SETTINGS_CHANGED

An audit record may contain:

- actor
- family
- action
- target
- timestamp
- relevant metadata
  Audit logs should not expose sensitive information unnecessarily.

14. Capy Architecture
    Capy is treated as an application subsystem rather than a decorative component.
    The system receives meaningful application events.
    Example:
    Task completed
    │
    ▼
    Application Event
    │
    ▼
    Capy Decision
    │
    ▼
    Capy Interaction

Possible events:
TASK_DUE_SOON
TASK_COMPLETED
GOAL_MILESTONE_REACHED
MESSAGE_UNREAD
APPROVAL_REQUIRED
ELECTION_STARTED
ELECTION_COMPLETED
ACHIEVEMENT_UNLOCKED
FAMILY_GOAL_COMPLETED

Capy should consider:

- event importance
- user context
- frequency
- previous interactions
- urgency
- whether the user is currently active
  The system should prevent repetitive or intrusive interactions.

15. Capy Presentation
    Capy can be presented through:

- static illustrations
- contextual illustrations
- subtle animations
- speech bubbles
- small UI hints
- dashboard appearances
- celebrations
- reminders
  The visual style should be inspired by elegant glass-like collectible sculpture.
  Capy should have a consistent visual identity across the application.
  The interface itself remains mature and restrained while Capy can provide more personality.

16. API Architecture
    The backend will expose a REST API initially.
    Example structure:
    /api/auth
    /api/users
    /api/families
    /api/families/:familyId/members
    /api/families/:familyId/tasks
    /api/families/:familyId/calendar
    /api/families/:familyId/finances
    /api/families/:familyId/goals
    /api/families/:familyId/dreams
    /api/families/:familyId/recipes
    /api/families/:familyId/shopping
    /api/families/:familyId/achievements
    /api/families/:familyId/messages
    /api/families/:familyId/announcements
    /api/families/:familyId/elections
    /api/families/:familyId/approvals
    /api/notifications
    /api/capy

The exact endpoints will be designed when each feature is implemented. 17. Error Handling
The backend will use centralized error handling.
Conceptual error types include:
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
DatabaseError
InternalServerError

The API should return consistent error responses.
Production responses must not expose:

- stack traces
- database errors
- internal file paths
- secrets
- implementation details

18. Frontend State Handling
    Major UI states should be explicitly designed.
    A data-driven component may have:
    Loading
    Empty
    Success
    Error
    Retry

For example:
Tasks

Loading
↓
Success → display tasks

Empty
↓
"Nothing planned yet"

Error
↓
"Something went wrong"
↓
Retry

19. Security Architecture
    Security controls include:

- secure authentication
- password hashing
- authorization
- family isolation
- input validation
- output safety
- secure cookies
- CSRF protection where applicable
- CORS configuration
- security headers
- rate limiting
- brute-force protection
- secure file upload handling
- dependency auditing
- secrets management
- audit logging
- safe error handling
  Security decisions should be evaluated against modern OWASP guidance.

20. File Upload Architecture
    Potential uploaded content includes:

- profile images
- recipe images
- dream images
- chat attachments
  Files should not be stored directly inside relational database records as large binary data unless there is a specific reason.
  The application should eventually use dedicated file/object storage.
  Uploads must be validated for:
- file size
- file type
- MIME type
- extension
- access permissions

21. Testing Architecture
    Testing will exist at multiple levels.
    Unit tests
    Used for:

- calculations
- utilities
- validation
- recurrence logic
- financial rules
- permission logic
  Component tests
  Used for:
- forms
- task cards
- goal components
- financial components
- navigation
- Capy interactions
  Integration tests
  Used for:
- authentication
- database operations
- authorization
- family isolation
- approval workflows
- elections
  End-to-end tests
  Important user journeys include:
  Register
  ↓
  Login
  ↓
  Create family
  ↓
  Invite members
  ↓
  Vote for leader
  ↓
  Create task
  ↓
  Complete task
  ↓
  Create expense
  ↓
  Request approval
  ↓
  Leader approves

22. CI/CD Architecture
    The project will eventually use GitHub Actions.
    A typical pipeline:
    Git Push
    │
    ▼
    Install dependencies
    │
    ▼
    Lint
    │
    ▼
    Type check
    │
    ▼
    Unit tests
    │
    ▼
    Integration tests
    │
    ▼
    Build
    │
    ▼
    Deploy

Deployment targets:
Frontend → Netlify
Backend → Render
Database → Railway
Source → GitHub

23. Observability
    The backend should eventually provide structured logging.
    Useful information includes:

- request ID
- timestamp
- HTTP method
- route
- response status
- duration
- user/family context where appropriate
- error ID
  Sensitive information must not be logged unnecessarily.

24. Performance
    Performance considerations include:

- lazy loading
- code splitting
- optimized images
- efficient database queries
- pagination
- caching
- minimizing unnecessary React renders
- API response optimization
  Performance work should be based on measurement rather than premature optimization.

25. Development Principles
    The project should prioritize:

- understandable code
- small focused modules
- strong typing
- explicit business rules
- reusable components
- secure defaults
- automated testing
- meaningful documentation
- consistent naming
- maintainability
  Complexity should be introduced only when it solves a real problem.

26. Architecture Evolution
    This architecture is a starting point rather than an immutable design.
    As the application develops, decisions may change when supported by:

- new requirements
- technical constraints
- security findings
- performance measurements
- usability testing
- deployment requirements
