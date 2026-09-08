# Database Notes

PostgreSQL is the production database. Flyway migration `V1__initial_schema.sql` creates `users`, `customer`, `agent`, `surveyor`, `policies`, `claims`, `payments`, `audit_logs`, and `password_reset_tokens`.

Relationships:

- A customer has many policies, claims, and payments.
- An agent may own many policies.
- A policy belongs to a customer and may be assigned to an agent.
- A claim belongs to a policy/customer and may be assigned to a surveyor.
- A payment may reference a policy/customer.
- Audit logs and reset tokens are independent operational tables.

Foreign keys and indexes are created by Flyway. Hibernate uses `ddl-auto=update` in development for compatibility with the existing project; production should use `DDL_AUTO=validate` after the schema is established. The seed runner is idempotent by checking for the admin account and should only run against a disposable demo database.

There are currently no endorsement, renewal, quote, document, reinsurance, commission, settlement, or inspection-report tables. Adding those should be done with new Flyway migrations rather than destructive edits to V1.