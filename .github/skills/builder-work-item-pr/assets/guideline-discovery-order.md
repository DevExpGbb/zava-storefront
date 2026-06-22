# Guideline discovery order

Use this file only when guideline paths are not already explicit.

## Goal

Resolve one guideline file for each required category:

1. security
2. architecture
3. documentation

## Candidate path order

Check paths in this order and pick the first existing match per category.

### Security

1. `.github/guidelines/SECURITY.md`
2. `.github/guidelines/SECURITY.guidelines.md`
3. `guidelines/SECURITY.md`
4. `guidelines/SECURITY.guidelines.md`
5. `SECURITY.md`
6. `SECURITY.guidelines.md`
7. `.github/instructions/*security*.md`

### Architecture

1. `.github/guidelines/ARCHITECTURE.md`
2. `.github/guidelines/ARCHITECTURE.guidelines.md`
3. `guidelines/ARCHITECTURE.md`
4. `guidelines/ARCHITECTURE.guidelines.md`
5. `ARCHITECTURE.md`
6. `ARCHITECTURE.guidelines.md`
7. `.github/instructions/*architecture*.md`

### Documentation

1. `.github/guidelines/DOCUMENTATION.md`
2. `.github/guidelines/DOCUMENTATION.guidelines.md`
3. `guidelines/DOCUMENTATION.md`
4. `guidelines/DOCUMENTATION.guidelines.md`
5. `DOCUMENTATION.md`
6. `DOCUMENTATION.guidelines.md`
7. `.github/instructions/docs-style-guide.instructions.md`

## Resolution rules

- Prefer repository files over workspace/session scratch files.
- Resolve exactly one file per category.
- If multiple matches exist at the same priority, choose the closest to repo root.
- If any category is missing, stop and report:
  - category
  - paths checked
  - required user action

