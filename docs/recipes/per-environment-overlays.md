---
title: Generate per-environment overlays
description: Run one contract against dev / staging / prod by switching --env, no copy-paste.
---

# Per-environment overlays — one contract, three environments

**Time:** 3 min · **Skill:** comfortable editing a YAML file

A contract is the same in `dev`, `staging`, and `prod` — only a handful of values (project, dataset suffix, retention, alert recipient) actually differ. The right answer is **one base contract + per-environment overlays**, not three near-identical copies.

## The pattern

A single `contract.fluid.yaml` carries an `overlays:` block. Switch environments via `fluid <command> --env <name>`; the overlay loader (`fluid_build/cli/_common.py::load_contract_with_overlay`) merges the matching block over the base before plan/apply runs.

```yaml
fluidVersion: "0.7.3"
kind: DataProduct
id: silver.orders_enriched
metadata:
  layer: Silver
  productType: ADP

# Base values — used in every env unless an overlay overrides them.
binding:
  platform: gcp
  project: my-project-dev
  dataset: orders
  retention_days: 7

quality:
  freshness_minutes: 60

overlays:
  dev:
    binding:
      project: my-project-dev
      dataset: orders_dev
    quality:
      freshness_minutes: 240

  staging:
    binding:
      project: my-project-staging
      dataset: orders_staging
      retention_days: 30

  prod:
    binding:
      project: my-project-prod
      dataset: orders
      retention_days: 365
    quality:
      freshness_minutes: 30
    alerts:
      - team: data-platform
        email: data-platform@example.com
```

Run the same contract three ways:

```bash
fluid plan  contract.fluid.yaml --env dev
fluid plan  contract.fluid.yaml --env staging
fluid plan  contract.fluid.yaml --env prod
fluid apply contract.fluid.yaml --env prod --yes
```

## What the overlay loader does

- **Deep-merges** the overlay over the base — scalar keys are overridden, lists are replaced wholesale (not concatenated), maps merge key-by-key.
- **Resolves env-var templates** (`${MY_VAR}`) in the merged contract before validation, so you can keep secrets out of YAML and inject them per-env via shell.
- **Treats `--env <name>` as canonical** — the merged contract carries `_env: <name>` so plans and applies log which overlay was active. Helpful for CI debugging.
- **Refuses unknown overlay names** at validation time — `fluid plan --env staaging` fails with a typo'd-overlay error, not a silent fallback to base.

## Env-var templates inside an overlay

Combine overlays with env vars when a value can't live in YAML:

```yaml
overlays:
  prod:
    binding:
      project: my-project-prod
    credentials:
      service_account_key: ${PROD_SA_KEY_PATH}
```

```bash
PROD_SA_KEY_PATH=/secrets/prod-sa.json fluid apply contract.fluid.yaml --env prod --yes
```

The template substitution runs *after* the overlay merge, so per-env env-var fragments can reference per-env variables without leaking into the base.

## Test all overlays in CI

A common CI shape — validate each overlay in parallel so a typo in one env doesn't make it to prod:

```yaml
# .github/workflows/contract-ci.yml (fragment)
jobs:
  validate:
    strategy:
      matrix:
        env: [dev, staging, prod]
    steps:
      - run: pip install --pre data-product-forge
      - run: fluid validate contract.fluid.yaml --env ${{ matrix.env }}
      - run: fluid plan     contract.fluid.yaml --env ${{ matrix.env }}
```

## See also

- [`fluid plan`](../cli/plan.md) — every `--env`-aware command takes the same flag
- [`fluid generate iac` `--env`](../cli/generate-iac.md#syntax) — overlays propagate into the IaC emit
- [Switch clouds with one line](./switch-clouds.md) — the sister recipe for swapping `binding.platform`
