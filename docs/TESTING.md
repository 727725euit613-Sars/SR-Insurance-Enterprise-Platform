# Testing Report

## Executed checks

| Check | Result |
| --- | --- |
| `src/backend/.\mvnw.cmd test` | PASS, 1 Spring context test |
| `npm run build` | PASS, Vite production bundle generated |
| `src/backend/.\mvnw.cmd clean test` | Environment-sensitive: Maven could not remove a locked `target` directory; removing generated `target` and rerunning tests passed |

## Important verified behaviors

- Public registration cannot select a privileged role.
- BCrypt password verification and JWT login/refresh are configured.
- Customer list/detail access is restricted to the linked account.
- Customer policy/claim/payment list and nested access are restricted to ownership.
- Claims require an active policy and reject duplicate policy/date/description submissions.
- Customer payments cannot select another customer's policy and cannot claim a completed status.
- Validation and global error responses are centralized.

## Remaining test work

The project still needs MockMvc integration tests for every role and sensitive endpoint, repository/service unit tests, frontend component tests, browser smoke tests, and PostgreSQL-backed migration tests. Swagger should be used to capture success, invalid input, missing ID, unauthenticated, forbidden role, duplicate, and invalid business-rule evidence for the final review.