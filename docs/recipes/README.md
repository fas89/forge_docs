---
title: Recipes
description: Short, copy-pasteable solutions to common Fluid Forge tasks.
---

# 🍳 Recipes

Short, copy-pasteable solutions to common tasks. Each recipe is self-contained and answers exactly one question.

> **Looking for narrative walkthroughs instead of one-pagers?** → [CLI by task](/forge_docs/cli/tasks/). Looking for the conceptual model? → [Concepts](/forge_docs/concepts/).

## Available recipes

| Recipe | Time | What it solves |
|--------|------|----------------|
| [Add a quality rule](./add-a-quality-rule.md) | 2 min | Block a deploy when a column has nulls or stale data. |
| [Switch clouds with one line](./switch-clouds.md) | 1 min | Take an existing local contract and redeploy it to BigQuery / Athena / Snowflake. |
| [Tag PII in your schema](./tag-pii.md) | 2 min | Get column-level masking on BigQuery / Snowflake without writing IAM JSON yourself. |
| [Consume one contract from another](./consumes-contract-to-contract.md) | 2 min | Wire a Silver/Gold product to upstream contracts via `consumes[]`. |
| [Per-environment overlays](./per-environment-overlays.md) | 3 min | One contract, three environments — switch via `--env`. |

## Coming soon — contributions welcome

These slots are reserved; pick one, write it up, open a PR. Each should be ~50 lines, runnable as-is.

- Ship to Dagster instead of Airflow
- Audit a contract for compliance
- Snapshot a contract before a risky change (`fluid bundle`)
- Set up a CI pipeline gate that blocks drift
- Hook in custom dbt macros via `hybrid-reference`
- Add a Slack alert when DQ fails

Tracked in [docs-content #recipes](https://github.com/Agenticstiger/forge_docs/issues?q=is%3Aopen+label%3Adocs-content).
