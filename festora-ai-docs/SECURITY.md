# Security, Privacy and Abuse-Prevention Requirements
## Festora AI

## 1. Threat model

Protect against:
- Unauthorized access to another user's event.
- Leaked Gemini API key.
- Malicious or malformed user input.
- Prompt injection embedded in event notes.
- Invalid or adversarial AI output.
- AI cost abuse and denial of service.
- Cross-event data leakage in exports or dashboards.
- Accidental overwriting of confirmed or user-owned data.
- Exposure of guest contact, dietary or accessibility information.
- Misconfigured Firestore rules and privileged server operations.

## 2. Authentication and authorization

- Use Firebase Authentication.
- Verify authentication on all trusted backend functions.
- Authorize access to the specific event and every child record.
- Never accept a client-provided UID as proof of identity.
- Deny access by default.
- Test both authorized and unauthorized cases in the emulator.
- If collaboration is introduced, check membership and role on every operation.

## 3. Secrets

- Store Gemini credentials in server-side secret management.
- Never prefix private credentials with `VITE_`.
- Do not commit `.env` files containing secrets.
- Commit `.env.example` with placeholders only.
- Rotate exposed credentials and remove them from active configuration; removing a key from the latest file does not erase Git history.
- Avoid printing secret values in logs or error messages.

## 4. Firestore rules

- Version control rules.
- Use the Emulator Suite and automated tests.
- Avoid broad rules such as `allow read, write: if request.auth != null`.
- Validate allowed fields, types, immutable fields and ownership where possible.
- Remember: Admin/server SDKs bypass Firestore Security Rules. Server code must enforce authorization independently.

## 5. AI-specific controls

- Treat model output as untrusted data.
- Validate with a strict schema.
- Enforce maximum lengths and array counts.
- Never execute generated code or interpret output as database queries.
- Never let model output select arbitrary Firestore paths or authorization roles.
- Keep system instructions separate from user-provided notes.
- Do not send unnecessary personal data to the model.
- Limit requests per user and cap generation size/cost.
- Do not claim live facts unless retrieved from a real, traceable integration.

## 6. Privacy

- Collect only data required for event planning.
- Explain why guest contact, dietary or accessibility data is collected if these features are enabled.
- Restrict guest data to authorized event members.
- Avoid storing sensitive personal details in AI prompts unless required.
- Define retention and deletion behavior.
- Ensure exports contain only the selected event's records.
- Follow applicable privacy and consumer obligations for the deployment context; seek qualified advice where needed.

## 7. Data deletion

Document whether event deletion is soft-delete or permanent deletion. If permanent deletion is selected, delete associated subcollections through a tested server-side workflow; deleting a parent Firestore document does not automatically delete its subcollections.

## 8. Abuse and operational limits

- Add per-user quotas and rate limiting to AI calls.
- Limit payload sizes and generation attempts.
- Add request timeouts and bounded retries.
- Monitor unusual usage and provider errors.
- Set billing budgets/alerts where available.
- Restrict CORS/origins for HTTP endpoints where applicable.
- Keep dependencies updated and audit production configuration.

## 9. Release blockers

Do not release if:
- A private key is exposed.
- One user can read or write another user's data.
- Production rules are permissive.
- AI output is persisted without validation.
- AI revision can silently overwrite actual spending or confirmed records.
- The app claims vendors are verified without evidence.
