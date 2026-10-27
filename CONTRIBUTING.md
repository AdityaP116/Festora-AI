# Contributing to Festora AI

Thank you for your interest in contributing to Festora AI! We welcome bug reports, documentation updates, and pull requests.

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors regardless of experience level, identity, or background. Please treat fellow contributors with respect, empathy, and professional courtesy.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` LTS
- **npm**: `v10.x` or higher
- **Git**

### 2. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Festora-AI.git
cd Festora-AI
```

### 3. Installation
Install dependencies for both the frontend client and the Cloud Functions backend:
```bash
# Install frontend dependencies
npm ci

# Install backend functions dependencies
npm --prefix functions ci
```

### 4. Environment Setup
```bash
# Copy the example environment template
cp .env.example .env
```
_Note: Never commit private API keys, secrets, or `.env` files into source control._

---

## Development Workflow

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Start Development Servers:**
   - **Terminal 1 (Backend API on port 5001):**
     ```bash
     npm run server
     ```
   - **Terminal 2 (Frontend Client on port 5173):**
     ```bash
     npm run dev
     ```
3. **Run Quality Checks Before Committing:**
   ```bash
   # Linting
   npm run lint

   # Type checking
   npx tsc -b
   npm --prefix functions run build

   # Automated tests
   npm test
   ```

---

## Pull Request Guidelines

1. **Keep PRs Focused**: Avoid mixing refactors with new features or unrelated fixes.
2. **Follow Existing Code Patterns**: Maintain strict TypeScript typing, avoid `any`, and preserve Zod validation schemas.
3. **Add Tests**: Ensure new endpoints, financial calculations, or plan revision logic have corresponding Vitest tests.
4. **Commit Messages**: Follow conventional commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).
5. **Open a PR**: Push to your fork and submit a Pull Request against the `main` branch with a clear summary of your changes.
