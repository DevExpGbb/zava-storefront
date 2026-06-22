---
name: build-and-pr
description: >
  Use this skill when the user provides a work item and wants it implemented as
  committed code changes on a new branch with a pull request on the
  zava-storefront repository. Trigger when the user says "build this feature",
  "implement this", "fix the review comments", "address PR feedback", "create a
  PR for this", "open a PR with this change", or pastes a feature brief or set
  of review findings and asks for them to be resolved. The skill reads team
  security, architecture, and documentation standards before writing any code,
  commits the changes to a new branch, runs lint and tests, fixes any failures,
  and only opens or updates the PR when all checks are green. Out-of-scope
  discoveries are noted in the PR description for a human reviewer.
---

# build-and-pr

Implements a work item -- feature brief or PR review findings -- as commits on a
new branch, then opens or updates a pull request on zava-storefront. Runs
`npm run lint` and `npm test` before opening; fixes failures before proceeding.

## How to invoke

Paste the work item text directly into the conversation and ask to "build" or
"implement" it, or to "fix the review comments". Optionally prefix a PR number
if you want to update an existing PR rather than open a new one.

---

## Bundled assets

- `assets/pr-body-template.md` -- loaded at Stage 5 (PR stage only).

## Guideline files (loaded at Stage 1)

The following instruction files apply automatically when working on this repo,
but Stage 1 explicitly re-reads them so their constraints are active in the
planning context:

- `.github/instructions/secure-coding-base.instructions.md`
- `.github/instructions/ci-cd-golden-paths.instructions.md`
- `.github/instructions/docs-style-guide.instructions.md`

---

## Pipeline

Work through every stage in order. Reload this plan before starting each stage.
The plan is the truth; recall is not.

---

### Stage 1 -- Read guidelines

Before writing a single line of code:

1. Read `.github/instructions/secure-coding-base.instructions.md`.
2. Read `.github/instructions/ci-cd-golden-paths.instructions.md`.
3. Read `.github/instructions/docs-style-guide.instructions.md`.

Confirm internally that you hold the constraints from all three. They are not
optional; every code change in this pipeline must satisfy them.

---

### Stage 2 -- Plan and scope guard

1. Decompose the work item into an ordered list of concrete file-change tasks.
   Write the list to `plan.md` in the session's plan store. Each task must be:
   - A single, completable unit of work.
   - Scoped to the work item. If a task looks useful but was not asked for,
     it is out of scope -- note it in a separate "Out of scope" section of
     `plan.md`; do not build it.

2. **Scope guard (mandatory):** Read the work item again. For each task in your
   list, ask: "Does completing this task directly fulfill part of the stated
   work item?" If the answer is no, move it to the out-of-scope list.

3. Name a branch: `feat/<slug>` for new features, `fix/<slug>` for bug fixes,
   `chore/<slug>` for housekeeping. Use lower-kebab-case. 25 chars max.

4. If the work item references a PR number to update (e.g. "PR #42"), record it
   in `plan.md` under `update_pr`.

---

### Stage 3 -- Implement

Reload `plan.md` before starting.

1. Create the branch:
   ```
   git checkout -b <branch-name>
   ```

2. Work through each task in `plan.md` in dependency order:
   - Read the existing file(s) before editing.
   - Apply only the change the task requires; do not refactor unrelated code.
   - Obey every constraint from the three guideline files loaded in Stage 1.
     Specifically:
     - **Security:** no secrets in code; parameterized queries only;
       authenticate + authorize at every new handler; default-deny.
     - **CI/CD/Architecture:** follow the golden-path patterns; no bespoke
       pipeline additions.
     - **Docs:** update inline docstrings and relevant markdown only where the
       change makes existing docs incorrect; follow the style guide.
   - After each logically complete task, commit:
     ```
     git add <files>
     git commit -m "<type>(<scope>): <imperative summary>

     Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
     ```
     Use Conventional Commits: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

3. Mark each task done in `plan.md` as you finish it.

---

### Stage 4 -- Verify (A9 Supervised Execution)

Reload `plan.md` before starting.

Run checks and interpret results deterministically -- do not assert "it probably
passes". The tool output is the ground truth.

**Check sequence (repeat up to 3 times):**

1. Run lint:
   ```
   npm run lint
   ```
2. Run tests:
   ```
   npm test
   ```
3. Interpret results:
   - **All green** -> proceed to Stage 5.
   - **Red lint** -> fix only the lines the linter flags; commit the fix;
     go to step 1. Count this as one retry.
   - **Red tests** -> read the failure message; fix the root cause (not the
     symptom); commit the fix; go to step 1. Count this as one retry.
   - **3 retries exhausted without green** -> stop fixing. Record the
     remaining failures in `plan.md` under `check_failures`. Proceed to
     Stage 5; the PR description will surface them for a human.

Do not skip this stage. Do not assert checks pass without running them.

---

### Stage 5 -- Open or update PR

Reload `plan.md` and `assets/pr-body-template.md` before starting.

1. Fill in the PR body template using the plan's task list, commit history,
   and any out-of-scope or check-failure notes.

2. **New PR** (no `update_pr` in plan.md):
   ```
   git push -u origin <branch-name>
   gh pr create --title "<title>" --body "<body>"
   ```

3. **Update existing PR** (`update_pr: <number>` in plan.md):
   ```
   git push origin <branch-name>
   gh pr edit <number> --body "<updated body>"
   ```

4. Output the PR URL to the user. Done.

---

## Hard stops

- **Secrets in code**: if any task requires putting a credential, token, or key
  into source -- stop. Explain the secure alternative (Key Vault ref, env var,
  OIDC) and do not proceed until the work item is revised.
- **Scope creep**: if Stage 3 reveals a coupling that makes the work item
  impossible without a large refactor, stop at the scope boundary. Commit
  what you have, note the blocker in the PR description, and open the PR as a
  draft so a human can decide.
- **3 check failures**: surface in PR; do not keep retrying silently.
