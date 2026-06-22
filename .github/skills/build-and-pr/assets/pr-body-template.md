# PR body template

Use this template when composing the pull request description at Stage 5.
Fill in every section; do not skip sections even if they are short.

---

```markdown
## Summary

<!-- One paragraph: what this PR does and why. Written for a human reviewer
     who has not read the work item. -->
<SUMMARY>

## Changes

<!-- Bullet list of concrete file/code changes. One bullet per logical change.
     E.g. "Added /health route in src/routes/health.ts" -->
<CHANGES>

## Testing

<!-- How was this verified? Reference the npm test output. -->
- `npm run lint`: <PASS | FAIL -- see notes below>
- `npm test`: <PASS | FAIL -- see notes below>

## Out of scope (noted for follow-up)

<!-- Items discovered during implementation that were NOT in the work item.
     Leave blank if none. A human reviewer decides whether to pick these up. -->
<OUT_OF_SCOPE_ITEMS or "None">

## Check failures (if any)

<!-- Populate only if Stage 4 exhausted its 3-retry budget.
     List the failing test/lint rule and the blocker reason. -->
<CHECK_FAILURES or "None -- all checks green">

## Guideline compliance

- [ ] No secrets committed (secure-coding-base s.1)
- [ ] All new handlers have auth (secure-coding-base s.3)
- [ ] All new DB queries parameterized (secure-coding-base s.2)
- [ ] CI/CD changes follow golden paths (ci-cd-golden-paths)
- [ ] Docs updated where code changed meaning (docs-style-guide)
```
