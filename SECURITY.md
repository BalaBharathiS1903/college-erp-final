Security findings and recommended actions

Summary of quick findings:

- Default secrets in development:
  - `backend/src/main/resources/application.properties` uses a dev fallback for `jwt.secret`.
  - Frontend seeds a default admin password in `frontend/src/utils/userStore.js` (`ChangeMe@First1`).
  - These are fine for local development but MUST be replaced via environment variables in production.

- Plaintext passwords in frontend store:
  - `frontend/src/utils/userStore.js` stores passwords in localStorage and validates them client-side. This is insecure for any real deployment. Move authentication server-side and store only hashed passwords (BCrypt) on the backend.

- Logging of sensitive info:
  - Several backend `run*.log` files show generated security passwords; avoid shipping log files in repo and do not commit secrets.

- JWT handling:
  - `JwtUtil` and `JwtAuthFilter` appear correct; ensure `jwt.secret` is provided via secure env var and has sufficient entropy (>= 32 bytes recommended).

Recommended next steps:

1. Require environment variables for secrets in deployment (CI/CD) and remove any hardcoded secrets from source.
2. Move authentication and password checks to the backend; use BCrypt for hashing and never expose hashed/cleartext passwords in the browser storage.
3. Remove build artifacts and runtime logs from the repository (add to `.gitignore`) and purge any committed secrets from history if necessary.
4. Run dependency vulnerability scanners (Snyk, `npm audit`, `mvn dependency:check`) before production deploy.
5. Add automated tests and CI checks (lint, build, scan) to catch regressions.

If you want, I can:
- Add a `SECURITY.md` (done) and a short `README` section explaining env vars to set for production.
- Replace client-side password seeding with a development-only script and gate it behind `NODE_ENV === 'development'`.
- Run `npm install` and a local build to validate no runtime errors from the new dependencies.

Reach out which of these you'd like me to implement next.
