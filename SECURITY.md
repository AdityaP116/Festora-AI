# Security Policy

## Supported Versions

Security updates and vulnerability patches are actively maintained on the primary development branch:

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security of Festora AI and its users seriously.

If you believe you have discovered a security vulnerability regarding authentication, cross-tenant isolation, prompt injection, or sensitive data leakage:

1. **Do NOT open a public GitHub issue** to report a security vulnerability.
2. Please report security issues confidentially using [GitHub Private Vulnerability Reporting](https://github.com/AdityaP116/Festora-AI/security/advisories/new) on the repository.
3. If private vulnerability reporting is unavailable, contact the project maintainer directly via GitHub profile messaging.

### What to Include in Your Report
- A clear description of the vulnerability.
- Steps to reproduce or a minimal proof of concept (PoC).
- Any potential impact on users or data isolation.

### Response Timeline
- We will acknowledge receipt of the report within 48 to 72 hours.
- We will keep you updated as we investigate and develop a remediation.
- Once fixed, credit will be given in the release notes if desired.

---

## Security Architecture Principles

- **Zero Client-Side Secrets**: Private keys (such as `GEMINI_API_KEY`) must strictly reside on the backend functions server or Secret Manager.
- **Strict Data Isolation**: Cloud Firestore rules strictly enforce owner UID boundaries (`users/{userId}/events/{eventId}`).
- **Input & Output Validation**: All network inputs and AI-generated proposals are strictly validated against Zod schemas before application.
