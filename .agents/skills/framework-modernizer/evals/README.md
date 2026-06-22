# Evals — framework-modernizer

This directory holds **two distinct test layers**. Both are valuable; they catch different failures.

| Layer | What it tests | Output | Runs in CI? |
|---|---|---|---|
| **Behavior evals** ([`evals.json`](./evals.json), [`triggers.json`](./triggers.json)) | The skill's actual LLM behavior. Each case runs twice: with the skill loaded and without it, so the value delta is measurable. | `<skill>-workspace/iteration-N/<case>/{with_skill,without_skill}/{outputs,timing.json,grading.json}` | No — manual / harness-driven. See "How to run" below. |
| **Catalog regression test** ([`run.js`](./run.js)) | The deterministic substrate the skill depends on. Locks the catalog regexes against the fixture so the team can't silently break detection by editing a regex. | Pure-Node script, exits `0` on green, `1` on drift. | Yes — fast, hermetic, no LLM. |

The behavior evals are what [agentskills.io calls "evals"](https://agentskills.io/skill-creation/evaluating-skills). The catalog test is a unit test for the catalog file. Both were scaffolded via the [Genesis](https://github.com/DevExpGbb/genesis) skill — Genesis's step-6 EVALS PLAN produces `evals.json` + `triggers.json`; the catalog regression script is independent contributor tooling.

---

## Layer 1 — Behavior evals (the real evals)

`evals.json` defines 3 content evals + the iteration workflow. `triggers.json` defines ~20 trigger queries (60/40 train/val) for the dispatch description.

### How to run

The agentskills.io spec describes the structure but does NOT prescribe a runner — execution is harness-driven. The current canonical recipe:

1. **Per case in `evals.json`**, spawn TWO subagent runs (or two clean sessions if your harness has no subagent isolation):
   - **with_skill**: skill is loaded into the subagent's context.
   - **without_skill**: same prompt, no skill — establishes the baseline.
2. Capture each run's outputs into `framework-modernizer-workspace/iteration-N/<case-id>/{with_skill|without_skill}/outputs/`. Capture `timing.json` (`total_tokens`, `duration_ms` — your harness should provide these) alongside.
3. Grade per the case's `assertions[]`. Script-graded assertions (`file_exists`, `contains_all_of`, `no_invented_bc_ids`, `skill_activated`, `skill_declines`, `no_file_writes`) are mechanical. `llm_judge` assertions get a fresh LLM call with the rubric. Write `grading.json`.
4. Aggregate to `framework-modernizer-workspace/iteration-N/benchmark.json`.
5. **Ship gate**: all 3 cases PASS with_skill AND show measurable delta vs without_skill. If `with_skill ≈ without_skill`, the skill is not adding value — redesign or delete.

For trigger evals: run via the harness's dispatcher (NOT the skill body). The question is whether the dispatch description matches the query. Validation split is the gate (≥0.5 on should-trigger, <0.5 on near-miss should-not-trigger).

### Iteration discipline (per agentskills.io)

- **Add assertions AFTER the first run.** You don't know what "good" looks like until you've seen actual output. Iteration 1 is exploratory; iteration 2 hardens with assertions.
- **Iterate the skill body, not the assertions, when assertions fail.** If you're tweaking assertions to pass, you've inverted the test.

---

## Layer 2 — Catalog regression test

```bash
node .apm/skills/framework-modernizer/evals/run.js
```

Exit `0` = all expected findings matched; exit `1` = drift (catalog regex changed, fixture changed, or expected file out of date). CI-friendly.

### What's here (Layer 2 files)

| Path | Purpose |
|---|---|
| `run.js` | Pure-Node runner. Re-implements catalog regexes line-by-line and diffs vs `expected/findings.txt`. |
| `fixtures/express4-app/server.js` | Deliberate Express 4 mini-app exercising 8 of the 12 catalog patterns (BC-001, BC-002, BC-006, BC-007, BC-101, BC-102, BC-201, BC-202). Also used by Layer 1 case `fm-c1-explicit-migration`. |
| `fixtures/express4-app/package.json` | Pins `express ^4.18.2` so the fixture is unambiguously v4. |
| `expected/findings.txt` | Ground truth — `BC-ID<TAB>file<TAB>line` rows the runner must reproduce exactly. |

### Why it works this way

- **The catalog is the contract.** Every detection regex in [`../references/express-4-to-5-breaking-changes.md`](../references/express-4-to-5-breaking-changes.md) must have a corresponding entry in `run.js` and (for any pattern exercised by the fixture) a row in `expected/findings.txt`.
- **The fixture is intentionally broken.** Don't "fix" the v4 patterns — the file's whole purpose is to fail v5 detection so the eval has something to assert on.
- **Annotations use `EXPECT-NNN` form**, not the literal pattern, so comments don't trigger false positives in the regex pass.

### Extending — add a new BC-NNN pattern

1. Add the pattern to [`../references/express-4-to-5-breaking-changes.md`](../references/express-4-to-5-breaking-changes.md) with: ID, classification, source citation, detect regex, fix.
2. Add `['BC-NNN', /your-regex/]` to the `PATTERNS` array in `run.js`.
3. Add a triggering example to `fixtures/express4-app/server.js` (annotated `// EXPECT-NNN ...`).
4. Add the expected `BC-NNN<TAB>server.js<TAB><line>` row to `expected/findings.txt`.
5. Run `node .apm/skills/framework-modernizer/evals/run.js` and adjust line numbers if needed.
6. (If the new pattern materially changes skill behavior on the fixture) extend `evals.json` case `fm-c1-explicit-migration` so Layer 1 covers it too.

---

## Forking the pattern (Next 13→14, React 17→18, etc.)

Same two-layer structure, swap the catalog and fixture. See [`../references/DESIGN.md`](../references/DESIGN.md) for the Genesis handoff packet, and ask Genesis to scaffold the evals for your new skill — it will produce `evals.json` + `triggers.json` per the spec.
