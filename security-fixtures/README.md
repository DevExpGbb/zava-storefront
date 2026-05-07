# ⚠️ `security-fixtures/` — intentionally vulnerable

This folder is a **standalone npm package** containing **deliberately outdated, vulnerable dependencies** for **Track 3 (`dependency-auditor`)** to exercise. It is **not imported anywhere in the running application**.

> **Banking / regulated audiences:** this is a workshop fixture. The vulnerable versions are pinned for pedagogical reasons. Production builds of `zava-storefront/` do **not** depend on this folder. The Track 3 skill audits **this fixture only**.

## Pinned vulnerable versions

| Package | Version | Why |
|---|---|---|
| `lodash` | 4.17.4 | Prototype pollution (CVE-2019-10744) |
| `axios` | 0.21.0 | SSRF (CVE-2020-28168) |
| `minimist` | 0.0.8 | Prototype pollution (CVE-2020-7598) |

## Run the audit (what Track 3 wraps as a skill)

```bash
cd zava-storefront/security-fixtures
npm install --no-audit --no-fund
npm audit --json > audit.json
```

Track 3's skill consumes `audit.json` and produces a triaged advisory report.
