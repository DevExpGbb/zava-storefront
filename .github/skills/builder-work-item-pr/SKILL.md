---
name: builder-work-item-pr
description: >-
  Use this skill when implementing a scoped work item in zava-storefront from a
  feature brief or review findings and you need branch, commit, and PR delivery
  with guardrails. Trigger on requests like "implement this brief", "address
  these review findings", "update PR with fixes", or "ship this change with
  green checks" even if the user does not say "builder skill". Read repository
  security, architecture, and documentation guidelines before editing, keep work
  inside explicit scope, run npm run lint and npm test, fix failures, and only
  then open or update the PR. If asks exceed scope, document deferred items in
  the PR description for human follow-up instead of implementing them.
license: MIT
metadata:
  author: Zava Engineering
  invocation: BOTH
  targets: common-only
---

# builder-work-item-pr

Implement one scoped work item end-to-end: branch -> code -> checks -> PR.

## When to use this

- The input is either:
  - a short feature brief, or
  - review findings to address in an existing change.
- The user wants code changes committed and a PR opened or updated.
- The user expects lint/test gates before PR creation or update.

## When NOT to use this

- The user asks for design-only output with no code changes.
- The user asks for broad refactors that are intentionally cross-epic.
- The target repository is not `zava-storefront`.

## Inputs

- Required: work item text (feature brief or review findings).
- Optional: target PR number, target branch naming hint, explicit scope limits.

## Output contract

Return a concise execution report with:

1. Branch name used.
2. Commit SHAs and summaries.
3. Check results (`npm run lint`, `npm test`).
4. PR status (opened or updated) and link/number.
5. Deferred out-of-scope items.

## Workflow

1. **Reground before action.**
   - Reload the active `plan.md` before starting and after every major phase.
   - Keep the acceptance anchor explicit:
     - read guideline files first,
     - implement only scoped work,
     - checks green before PR open/update.

2. **Resolve guideline sources.**
   - If guideline file paths are not explicit, read `assets/guideline-discovery-order.md`.
   - Locate one file per category: security, architecture, documentation.
   - If any category is missing, stop and report a blocker.

3. **Extract constraints with guideline personas (three child threads).**
   - Spawn one child thread per category using these personas:
     - `references/personas/security-guideline-persona.md`
     - `references/personas/architecture-guideline-persona.md`
     - `references/personas/documentation-guideline-persona.md`
   - For each child, pass:
     - the work-item scope summary,
     - the resolved guideline file path for that category.
   - Require each child to return:
     - `must_follow`
     - `must_avoid`
     - `verification_points`
   - Parent thread synthesizes all three outputs into one normalized constraint set.

4. **Classify scope before edits.**
   - Read `assets/scope-boundary-template.md` when classifying.
   - Split requested work into:
     - in-scope for this run,
     - out-of-scope and deferred.
   - If everything is out-of-scope, stop and return the defer list without edits.

5. **Create or reuse branch.**
   - If work is not on a dedicated feature branch, create one.
   - Use a short kebab-case branch name tied to the work item.

6. **Implement in-scope changes only.**
   - Apply minimal, coherent edits that satisfy:
     - the work item,
     - extracted constraints,
     - existing project patterns.
   - Commit in logical units with clear messages.

7. **Run mandatory gates and fix until green.**
   - Run `npm run lint`.
   - Run `npm test`.
   - If either fails, fix the failures and re-run both commands.
   - Do not open or update PR while either gate is red.

8. **Compose PR body and open/update PR.**
   - Read `assets/pr-description-template.md` immediately before writing PR text.
   - Include:
     - implemented scope,
     - check outcomes,
     - deferred out-of-scope items.
   - Open a new PR if none exists for the branch; otherwise update the existing PR.

9. **Return final execution report.**
   - Include branch, commits, gate results, PR status, and deferred items.

## Scope guardrails

- Never silently expand scope.
- Never convert deferred items into implementation without explicit user approval.
- Never claim checks passed unless they passed in this run.
- Never open/update PR before both checks are green.

## Guideline persona contract

Each guideline persona output must follow this shape:

```text
<category>
- must_follow:
  - <rule>
- must_avoid:
  - <rule>
- verification_points:
  - <check>
```

Parent synthesis output:

```text
normalized_constraints
- must_follow:
  - <deduplicated rule>
- must_avoid:
  - <deduplicated rule>
- verification_points:
  - <deduplicated check>
```

## Deferred item policy

When scope exceeds this run, add each deferred item to the PR under
"Deferred for human follow-up" with:

- item
- reason deferred
- suggested next step

## Structured templates

### Scope contract template

Use this structure before coding:

```text
Scope contract
- In scope:
  - <item>
  - <item>
- Deferred:
  - <item> | reason: <why deferred> | suggested follow-up: <next step>
- Constraints to honor:
  - <constraint>
  - <constraint>
```

### Final report template

```text
Execution report
- Branch: <name>
- Commits:
  - <sha> <summary>
  - <sha> <summary>
- Checks:
  - npm run lint: PASS|FAIL
  - npm test: PASS|FAIL
- PR: OPENED|UPDATED|BLOCKED <reference>
- Deferred:
  - <item> | reason | follow-up
```

## Failure handling

- If guideline files cannot be found: stop and report missing categories.
- If any required guideline persona is unavailable: stop and report the missing persona path.
- If checks remain red after reasonable fix iterations: stop, report failing output,
  and do not open/update PR.
- If runtime cannot open/update PR: report exact blocker and keep commits on branch.
