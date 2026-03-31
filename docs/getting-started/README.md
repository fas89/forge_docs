# Getting Started

Get a working data product running in under 2 minutes — no cloud account required.

::: tip No Cloud Needed
Fluid Forge ships with a **local** provider powered by DuckDB. Everything runs on your laptop.
When you're ready for production, switch to [GCP](/providers/gcp), [AWS](/providers/aws), or [Snowflake](/providers/snowflake).
:::

## Prerequisites

- **Python 3.9+** (`python3 --version`)
- **pip** (included with Python)
- No cloud credentials needed for local development

## Install

```bash
pip install fluid-forge
```

Verify the installation:

```bash
fluid version
# Fluid Forge CLI v0.7.1

fluid doctor
# Reports Python version, installed providers, and dependencies
```

## Create Your First Project

```bash
fluid init my-project --quickstart
cd my-project
```

This scaffolds a ready-to-run project:

```
my-project/
├── contract.fluid.yaml   # Your data product definition (the single source of truth)
├── data/                  # Sample CSV data
│   ├── customers.csv
│   └── orders.csv
└── .fluid/               # Local state (DuckDB database, logs)
```

## Validate the Contract

Check that your contract is well-formed before running anything:

```bash
fluid validate contract.fluid.yaml
# ✅ Contract validation passed!
```

## Preview the Plan

See what Fluid Forge will do — without actually doing it:

```bash
fluid plan contract.fluid.yaml
# Shows: load data → run transformations → write outputs
```

## Run It

Execute the contract end-to-end:

```bash
fluid apply contract.fluid.yaml --yes
# ⏳ Reading sources...
# ⏳ Running transformations...
# ✅ Pipeline complete — output written to runtime/out/
```

**That's it.** You have a working data product.

---

## What Just Happened?

```
contract.fluid.yaml
        │
        ▼
┌──── fluid validate ────┐   Schema checks, required fields, SQL syntax
└────────────┬────────────┘
             ▼
┌──── fluid plan ────────┐   Pure planning — no side effects
│ load_data → sql → out  │
└────────────┬────────────┘
             ▼
┌──── fluid apply ───────┐   Execute actions against the local provider
│ DuckDB ← CSV → output  │
└─────────────────────────┘
```

1. **`fluid init`** created a **contract** — a YAML file that declaratively describes your data product (sources, schema, transformations, quality rules).
2. **`fluid validate`** checked the contract against Fluid Forge's schema and best practices.
3. **`fluid plan`** generated an execution plan (what to load, transform, and output).
4. **`fluid apply`** loaded the sample data, ran the embedded SQL transformation, and wrote the results.

The contract is the single source of truth. Change the YAML, re-run `fluid apply`, and the output updates. The apply is **idempotent** — safe to run repeatedly.

---

## Explore Your Contract

Open `contract.fluid.yaml` in your editor. Key sections:

| Section | Purpose |
|---------|---------|
| `metadata` | Ownership, domain, data layer |
| `exposes` | Output tables with schemas and bindings |
| `builds` | SQL transformations (embedded or referenced) |
| `sovereignty` | Data residency and compliance rules |
| `accessPolicy` | Who can read, write, and query |

## Essential Commands

```bash
fluid validate contract.fluid.yaml          # Check contract correctness
fluid plan contract.fluid.yaml              # Preview what will happen
fluid apply contract.fluid.yaml --yes       # Execute the pipeline
fluid verify contract.fluid.yaml            # Post-deployment verification
fluid diff contract.fluid.yaml              # Detect drift from deployed state
fluid viz-graph contract.fluid.yaml         # Visualize data lineage
fluid generate-airflow contract.fluid.yaml  # Generate an Airflow DAG
```

Run `fluid --help` for the full command list, or `fluid <command> -h` for per-command help.

---

## Deploy to the Cloud

When you're ready to move beyond local development:

### Google Cloud (BigQuery)

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

fluid apply contract.fluid.yaml --provider gcp
```

See the full [GCP walkthrough](/walkthrough/gcp).

### AWS (S3 + Athena)

```bash
aws configure

fluid apply contract.fluid.yaml --provider aws
```

See the [AWS provider guide](/providers/aws).

### Snowflake

```bash
# Set credentials in .env
export SNOWFLAKE_ACCOUNT=your_account
export SNOWFLAKE_USER=your_user

fluid apply contract.fluid.yaml --provider snowflake
```

See the [Snowflake provider guide](/providers/snowflake).

---

## Generate Orchestration Code

Export your contract as production Airflow, Dagster, or Prefect code:

```bash
# Airflow DAG
fluid generate-airflow contract.fluid.yaml -o dags/pipeline.py

# Dagster pipeline
fluid export contract.fluid.yaml --format dagster -o pipeline.py

# Prefect flow
fluid export contract.fluid.yaml --format prefect -o flow.py
```

See the [orchestration walkthrough](/walkthrough/export-orchestration) for details.

---

## Troubleshooting

### `fluid: command not found`

Ensure the install location is on your `PATH`:

```bash
# Try running directly
python -m fluid_build.cli --help

# Or add pip's bin directory to PATH
export PATH="$HOME/.local/bin:$PATH"
```

### `No module named 'duckdb'`

The local provider requires DuckDB:

```bash
pip install duckdb
```

### `Could not find Application Default Credentials`

This only affects GCP deployments:

```bash
gcloud auth application-default login
```

### Need more help?

```bash
fluid doctor     # Diagnose system issues
```

---

## Next Steps

| Goal | Where to Go |
|------|-------------|
| **Hands-on tutorial** | [Local Walkthrough](/walkthrough/local) — build Netflix analytics from scratch |
| **Deploy to cloud** | [GCP](/providers/gcp) · [AWS](/providers/aws) · [Snowflake](/providers/snowflake) |
| **CI/CD pipeline** | [Universal Pipeline](/walkthrough/universal-pipeline) — one Jenkinsfile for all clouds |
| **All commands** | [CLI Reference](/cli/) |
| **Contribute** | [Contributing Guide](/contributing) |

### Need more help?

```bash
fluid doctor          # System diagnostics
fluid <command> -h    # Per-command help
```

- 📚 [CLI Reference](/cli/) — all commands with examples
- 🐛 [Report an issue](https://github.com/agentics-rising/fluid-forge-cli/issues)

---

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://fluidhq.io">Agentics Transformation Pty Ltd</a> · Open source under Apache 2.0</p>
