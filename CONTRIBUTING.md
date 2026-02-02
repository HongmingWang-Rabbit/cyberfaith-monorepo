# Contributing to CyberFaith

## Branch Protection (Recommended)

Configure these rules on the `main` branch in GitHub Settings → Branches:

- **Require status checks to pass** — select the `ci` job
- **Require branches to be up to date before merging**
- **Require pull request reviews** (at least 1 approval)

## PR Workflow

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes, commit with clear messages
3. Push and open a PR against `main`
4. CI runs automatically — fix any failures
5. Get a review, then merge

## Local Development

```bash
pnpm install
pnpm dev        # start all apps
pnpm typecheck  # type checking
pnpm test       # run tests
pnpm build      # production build
```

All commands use Turbo for parallel execution and caching.
