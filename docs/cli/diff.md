# `fluid diff`

Stage 5 of the 11-stage pipeline. Detect configuration drift between the desired contract state and deployed resources — or, with `--baseline`, run a semantic [version diff](#contract-version-diff) between two revisions of a contract.

## Syntax

```bash
fluid diff CONTRACT
```

## Key options

| Option | Description |
| --- | --- |
| `--state` | Previous `apply_report.json`. Required for hard-fail drift gating (see below). |
| `--env` | Apply an environment overlay (drift mode only). |
| `--out` | Output file for the diff report (default `runtime/diff.json`). |
| `--exit-on-drift` | Exit with code `1` when drift is detected **and** a `--state` baseline was supplied. |
| `--baseline` | Compare against an older revision of the contract — switches `diff` into version-diff mode (see below). |
| `--fail-on-breaking` | In version-diff mode, exit `1` when a breaking change is found. |
| `--format` | Version-diff output format — `text` (default), `json`, or `markdown`. |

## Examples

### Basic drift check

```bash
fluid diff contract.fluid.yaml
fluid diff contract.fluid.yaml --env prod
fluid diff contract.fluid.yaml --out runtime/diff.json
```

### CI-gated drift detection

```bash
# First apply — saves the state we'll diff against next time
fluid apply runtime/plan.json --report runtime/apply-report.json --yes

# Subsequent CI runs — compare against the saved state
fluid diff contract.fluid.yaml \
  --state runtime/apply-report.json \
  --exit-on-drift
# exit 1 on drift, exit 0 if clean
```

## `--exit-on-drift` semantics

The exit-on-drift gate has one important conditional: it only fires when a `--state` baseline was supplied.

| State supplied? | Drift detected? | `--exit-on-drift` behaviour |
| --- | --- | --- |
| No | (every desired resource is "new") | Logged as `diff_exit_on_drift_skipped` with a pointer to `--state`; **exit 0**. |
| Yes | No | Clean; **exit 0**. |
| Yes | Yes | **Exit 1**. |

**Why:** most providers don't implement live inventory yet, so without `--state` the `actual_resources` set is empty and every desired resource appears as `added`. Under a naïve exit-on-drift that would make every first-ever pipeline run fail at stage 5 — which is wrong. The gate is meant to detect **unexpected** changes against a known baseline, not "we don't know the baseline yet".

If you want hard-fail drift gating in CI, wire the last apply's `apply_report.json` as `--state` to enable real drift comparison.

## Provider resolution

In drift mode `fluid diff` needs a provider to enumerate the desired resources. There is no `--provider` flag on `diff` — it resolves the provider in two steps:

1. `FLUID_PROVIDER=<name>` env var (when exported).
2. `contract.binding.platform` — the auto-detected fallback, used when `FLUID_PROVIDER` is unset.

The auto-detection is logged as `diff_provider_inferred platform=<name> source=contract.binding.platform`. To diff against a non-default provider, export `FLUID_PROVIDER` before the run:

```bash
FLUID_PROVIDER=snowflake fluid diff contract.fluid.yaml --state runtime/apply-report.json
```

Version-diff mode (`--baseline`) needs no provider at all — it is a pure structural comparison between two contract files.

## Contract version diff

Passing `--baseline` switches `fluid diff` from drift detection to a **semantic version diff** between two revisions of the same contract:

```bash
fluid diff v2/contract.fluid.yaml --baseline v1/contract.fluid.yaml
fluid diff v2/contract.fluid.yaml --baseline v1/contract.fluid.yaml --fail-on-breaking
fluid diff v2/contract.fluid.yaml --baseline v1/contract.fluid.yaml --format markdown
```

This is contract-aware comparison, not generic schema differencing. Each change is classified as breaking or non-breaking, and the diff understands:

- **Type precision and scale** — `DECIMAL(p,s)` and `VARCHAR(n)` widening (safe) versus narrowing (breaking).
- **Nested structures** — it recurses through `columns[].fields[]`.
- **PII annotation drift** — a column gaining or losing a PII tag.
- **Policy narrowing** — tighter `agentPolicy` or data-sovereignty rules.
- **Quality severity escalation** — a quality rule promoted to a stricter severity.

`--fail-on-breaking` makes the command exit `1` on any breaking change, so it drops into CI as a contract-compatibility gate. `--format json` or `markdown` produce a structured report for PR comments or release notes.

## Notes

- The report written to `--out` contains three buckets: `added`, `removed`, `unchanged` — plus the full `desired_actions` list for post-hoc analysis.
- `--exit-on-drift` composes cleanly with `fluid diff --state <prior-apply> --exit-on-drift` in Jenkins / GitHub Actions — it gives you a deploy-blocking drift check without a custom parser.
