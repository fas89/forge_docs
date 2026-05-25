# `fluid generate iac`

Review-only emit of an OpenTofu module from a FLUID contract. `fluid apply` against a cloud provider auto-runs the same generator and hands the result to `tofu apply` — no flag needed; engine selection is per-provider (`local` keeps its native apply, `aws` / `gcp` / `snowflake` route through OpenTofu).

::: tip Available in 0.8.3 (PR #140)
`v0.8.3` introduces the **OpenTofu autogenerator**: `fluid apply` for cloud providers now compiles the contract to a deterministic OpenTofu `main.tf.json` and delegates apply / state / drift / idempotency to the `tofu` binary. `local` keeps its native DuckDB apply — no `tofu` needed for the local-first onboarding path.
:::

## Syntax

```bash
fluid generate iac <contract> [--provider PROVIDER] [--out DIR] [--env NAME] [--shadow] [--validate]
```

| Option | Description |
|---|---|
| `<contract>` | Path to FLUID contract file (YAML/JSON). |
| `--provider {auto,aws,gcp,snowflake}` | Target cloud. Default `auto` — inferred from the contract. |
| `--out`, `-o DIR` | Output directory for the emitted module. Default `runtime/iac`. |
| `--env NAME` | Environment overlay name (matches your contract's overlay block, e.g. `dev` / `staging` / `prod`). |
| `--shadow` | After emitting, shadow-compare resource parity against the native planner. Catches a divergence between the OpenTofu emission and what `fluid plan` would have produced. |
| `--validate` | After emitting, run `tofu validate` on the module (requires `tofu` on `PATH`). |

## Examples

```bash
# Review what fluid apply would emit for AWS
fluid generate iac contract.fluid.yaml --provider aws --out ./review

# Per-environment review
fluid generate iac contract.fluid.yaml --env staging --out ./review/staging

# Emit + validate against the planner + tofu validate in one pass
fluid generate iac contract.fluid.yaml --shadow --validate
```

The emitted directory contains `main.tf.json` (the compiled module), provider blocks, and a `manifest.json` describing how the contract mapped to resources. Inspect it before you run `fluid apply`.

## Apply via OpenTofu

```bash
# Cloud providers auto-route through OpenTofu on v0.8.3 — no flag needed.
fluid apply contract.fluid.yaml --provider aws --yes
# → ... [iac] tofu init
# → ... [iac] tofu plan
# → ... [iac] plan-binding verified
# → ... [iac] tofu apply -auto-approve
```

Engine selection is automatic and per-provider (`apply.py::resolve_apply_engine`) — `local` keeps its native DuckDB apply; `aws` / `gcp` / `snowflake` route through OpenTofu. There is no `--engine` flag on `fluid apply`.

## Supported providers

`v0.8.3` ships built-in IaC plugins for three cloud targets. Each is a modular `IacProviderPlugin` (dbt-adapter pattern); third parties can register their own via the [Provider SDK](/forge_docs/providers/custom-providers).

| Provider | Resources emitted |
|---|---|
| `aws` | S3 buckets / IAM roles + policies / Glue databases + tables + column comments / Athena workgroups |
| `gcp` | BigQuery datasets + tables / IAM bindings / GCS buckets |
| `snowflake` | Databases / schemas / tables / column comments (Horizon-aware) / file formats / stages |

Catalog metadata that previously lived in the retired `glue` and `snowflake_horizon` publish-side registrars is now emitted into `aws_glue_catalog_table.parameters` and `snowflake_table` column comments directly — one source of truth, drift-detected by `tofu plan`. See [catalog overview](./catalogs/overview.md#retired-registrars-glue-snowflake-horizon).

## Operational requirements

- **`tofu ≥ 1.6.0` on `PATH`.** `require_tofu_version()` catches the silent `terraform`-on-`PATH`-as-`tofu` mixup at apply time.
- **Subprocess timeout:** default `1800` seconds per `tofu` invocation. Override via `FLUID_TOFU_TIMEOUT_SECONDS=<seconds>`.

## Security gates

### Plan-binding integrity

The plan-binding gate from the native engine is replicated for OpenTofu — `_apply_opentofu_engine.py::_verify_plan_binding_for_opentofu` re-computes the `bundleDigest` and `planDigest` before any `tofu apply`. A tampered `plan.json` is rejected.

The emergency escape hatch is `--no-verify-plan-binding`; the apply logs at `WARNING` whenever it's used.

### Destructive operations

`--allow-data-loss` is the override for destructive gate. When used, the apply emits a `WARNING` log line and a structured `opentofu_destructive_gate_override` event so CI log-scrapers can pick it up.

## Brownfield: import existing resources

If the target cloud already has resources you want to fold into the IaC layer (rather than recreate), each provider plugin exposes a `discover_imports` hook that wires `tofu import` automatically. Run `fluid generate iac --out ./review` first, inspect the emitted resources against your live cloud, then `cd review && tofu init && tofu import …` for each pre-existing resource. The provider plugin's `discover_imports` produces the import commands for you.

## What didn't change

- **The contract.** No schema change — `v0.8.3` contracts are byte-identical to `v0.8.0` contracts.
- **The plan stage.** `fluid plan` still produces the canonical `Action` list; the OpenTofu engine consumes that list and compiles to `main.tf.json`.
- **`local` provider.** `local` keeps its native DuckDB apply path. `fluid generate iac --provider local` is a no-op.

## See also

- [Catalog overview](./catalogs/overview.md) — where the retired Glue + Snowflake Horizon registrars now live
- [Providers vs Platforms](/forge_docs/concepts/providers-vs-platforms.html) — engine column added in `v0.8.3`
- [`fluid apply`](./apply.md) — the user-facing apply command that auto-routes through OpenTofu
- [Network safety](/forge_docs/advanced/network-safety.html) — outbound HTTP posture for cloud SDK calls
