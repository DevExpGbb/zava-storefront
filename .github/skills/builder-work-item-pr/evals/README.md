# Evals - builder-work-item-pr

This directory holds behavior and trigger eval definitions for the
`builder-work-item-pr` skill.

## Files

- `evals.json`: content evals for feature-brief, review-findings, and overscope guard paths.
- `triggers.json`: dispatch description trigger and near-miss queries with 60/40 train/val split.

## Run model

Run each content case twice:

1. with skill loaded
2. without skill loaded

Compare quality and safety behavior. If outputs are indistinguishable,
the skill is not adding enough value and should be revised.

Use validation split from `triggers.json` as the trigger ship gate:

- should-trigger rate >= 0.5
- should-not-trigger rate < 0.5

