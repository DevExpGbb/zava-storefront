# Scope boundary template

Use this template before any code edit.

## Scope contract

```text
Scope contract
- Work item summary:
  - <one sentence>

- In scope for this run:
  - <deliverable>
  - <deliverable>

- Deferred for human follow-up:
  - <item> | reason: <why out-of-scope> | follow-up: <suggested next step>
  - <item> | reason: <why out-of-scope> | follow-up: <suggested next step>

- Constraints to honor from guidelines:
  - <constraint>
  - <constraint>

- Exit criteria:
  - Code changes for all in-scope deliverables are committed.
  - npm run lint passes.
  - npm test passes.
  - PR contains deferred section.
```

## Classification rules

- In scope:
  - directly requested,
  - bounded in effort,
  - needed to complete this work item.
- Deferred:
  - requires larger redesign,
  - requires cross-team coordination,
  - is not required for requested acceptance.

## Hard stop

If in-scope list is empty after classification, do not edit code.
Return defer list and ask for narrowed or changed scope.

