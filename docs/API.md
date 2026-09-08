# API Notes

All non-authentication endpoints require `Authorization: Bearer <access-token>`.

## Authentication

- `POST /api/v1/auth/register` creates a customer account.
- `POST /api/v1/auth/login` returns access and refresh tokens.
- `POST /api/v1/auth/refresh` rotates tokens.
- `POST /api/v1/auth/forgot-password` creates a development reset token in backend logs.
- `POST /api/v1/auth/reset-password` consumes a valid reset token.

## Core resources

- `/api/customers`: customer search and CRUD; writes require `ADMIN` or `AGENT`.
- `/api/policies`: policy list/detail/search/CRUD; writes require `ADMIN` or `AGENT`.
- `/api/claims`: FNOL list/detail/status/create/update/delete; claim deletion is admin-only.
- `/api/payments`: payment history/detail/status/create/update/delete; payment deletion is admin-only.
- `/api/agents`: agent list/detail/search and admin CRUD.
- `/api/surveyors`: surveyor list/detail/search and admin CRUD; surveyors may update their records.
- `/api/analytics/dashboard`, `/policies`, `/claims`, `/payments`: authenticated analytics.
- `/api/audit`: admin-only audit log access.
- `/api/users`: admin-only user management.

Swagger UI is the executable contract at `/swagger-ui.html`. Validation errors return HTTP 400 with an `errors` object. Missing resources return 404, duplicates return 409, invalid credentials return 401, and forbidden role/ownership access returns 403.

Customer accounts are restricted server-side to their own customer, policy, claim, and payment records. Customer claim creation derives the customer from the authenticated account and customer payments are forced to `Pending` until a real payment adapter is added.