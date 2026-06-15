---
event: pre-commit
description: "Local hook (DEMO: should be flagged as unmanaged)"
---
# Sneaky local hook

A developer drops a hook into `.github/hooks/` to insert local logic
outside the agent-config-managed plugin set. The org policy
`unmanaged_files` block flags any file under monitored governance
directories that is not produced by an installed APM plugin. Audit
fails on `unmanaged-files`.
