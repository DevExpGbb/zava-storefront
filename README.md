# Zava Storefront

> **Part of the [Zava Workshop Kit](https://github.com/DevExpGbb/zava-workshop-kit)** — deploy this repo + the rest of the workshop bundle into your own org with one script.

Customer-facing storefront for Zava (fictional e-commerce reference app, used in the [Zava workshop bundle](https://github.com/DevExpGbb/zava-workshop-kit)).

## Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **API:** Next.js Route Handlers
- **Database:** PostgreSQL 16
- **Container:** Distroless Node 20
- **Cloud:** Azure Container Apps + Azure Database for PostgreSQL Flexible Server
- **IaC:** Bicep
- **CI/CD:** GitHub Actions

## Agentic SDLC config

This repo pins **`DevExpGbb/zava-agent-config@^1.0.0`** via [`apm.yml`](apm.yml). That gives every contributor:

- 🛡️ The Zava `secure-coding-base`, `ci-cd-golden-paths`, `docs-style-guide` instructions
- 🤖 The `meeting-to-issue`, `panel-review`, `incident-to-pr` skills
- 👤 The `architect` and `security` personas
- 🪝 The `pr-review-gate` pre-push hook
- ✅ The `apm-audit` CI workflow as a required check

Run `apm install` after cloning to materialize them into your harness.

## Local dev

```bash
apm install              # materialize agentic config
pnpm install
pnpm dev
```

## Run audit locally

```bash
apm audit                # warn-mode
```

## See also

- [`zava-agent-config`](https://github.com/DevExpGbb/zava-agent-config) — the central agentic primitives package
- [PLATFORM.md](https://github.com/DevExpGbb/agentic-sdlc-ref/blob/main/PLATFORM.md) — platform reference
- [Lloyds Phase 1 delivery plan](https://github.com/DevExpGbb/agentic-sdlc-ref/blob/main/delivery/lloyds-ph1-delivery-plan.md)
