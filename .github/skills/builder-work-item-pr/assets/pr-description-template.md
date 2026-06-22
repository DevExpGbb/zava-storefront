# PR description template

Use this template right before opening or updating the PR.

```markdown
## Summary

- Implemented scoped work item: <short title>
- Source input type: <feature brief | review findings>

## Implemented scope

- <delivered change>
- <delivered change>

## Guideline alignment

- Security: <key constraints applied>
- Architecture: <key constraints applied>
- Documentation: <key constraints applied>

## Validation gates

- `npm run lint`: PASS
- `npm test`: PASS

## Deferred for human follow-up

- <item> | reason: <why deferred> | suggested follow-up: <next step>
- <item> | reason: <why deferred> | suggested follow-up: <next step>

## Notes

- Any risk or follow-up context that reviewers should know.
```

## Rules

- Keep deferred items explicit, never implied.
- Do not claim PASS for checks that were not executed in this run.
- If no deferred items exist, keep the section and write `None`.

