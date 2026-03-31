# CLI Reference

Fluid Forge ships with 40+ commands organized into functional categories. Run `fluid --help` for the full list or `fluid <command> -h` for per-command details.

::: tip
```bash
fluid --help              # See all commands
fluid <command> -h        # Help for a specific command
fluid doctor              # Check your system is ready
```
:::

## Cheat Sheet

The commands you'll use most often:

| Task | Command |
|------|---------|
| Create project | `fluid init my-project --quickstart` |
| Validate contract | `fluid validate contract.fluid.yaml` |
| Preview changes | `fluid plan contract.fluid.yaml` |
| Deploy / run | `fluid apply contract.fluid.yaml --yes` |
| Verify deployment | `fluid verify contract.fluid.yaml` |
| Run build jobs | `fluid execute contract.fluid.yaml` |
| Detect drift | `fluid diff contract.fluid.yaml` |
| Visualize lineage | `fluid viz-graph contract.fluid.yaml` |
| Generate Airflow DAG | `fluid generate-airflow contract.fluid.yaml -o dag.py` |
| Check governance | `fluid policy-check contract.fluid.yaml` |
| AI-guided creation | `fluid forge --mode copilot` |
| System diagnostics | `fluid doctor` |

---

## Core Workflow

These four commands form the standard development loop: **init → validate → plan → apply**.

### `fluid init`

Create a new Fluid Forge project with sample data and a working contract.

```bash
fluid init <name> [options]
```

| Option | Description |
|--------|-------------|
| `--quickstart` | Create a working example with sample data (recommended) |
| `--scan` | Import an existing dbt / Terraform project |
| `--wizard` | Interactive guided setup |
| `--blank` | Empty project skeleton |
| `--provider <name>` | Target provider: `local` (default), `gcp`, `aws`, `snowflake` |
| `--template <name>` | Start from a named template (e.g. `customer-360`) |
| `--no-run` | Don't auto-execute the pipeline after creation |
| `--dry-run` | Preview what would be created |

```bash
fluid init my-project --quickstart           # Quick start (recommended)
fluid init --scan                            # Import existing dbt project
fluid init analytics --provider gcp --quickstart  # GCP-targeted project
```

[Full init docs →](./init.md)

---

### `fluid validate`

Check a contract for schema correctness, required fields, provider compatibility, and SQL syntax.

```bash
fluid validate <contract-file> [options]
```

| Option | Description |
|--------|-------------|
| `--env <name>` | Apply an environment overlay before validating |
| `--verbose` | Show detailed validation output |

```bash
fluid validate contract.fluid.yaml
# ✅ Contract validation passed!
```

[Full validation docs →](./validate.md)

---

### `fluid plan`

Generate an execution plan showing what resources will be created, modified, or removed — **without executing anything**. Pure planning, no side effects.

```bash
fluid plan <contract-file> [options]
```

| Option | Description |
|--------|-------------|
| `--env <name>` | Environment overlay |
| `--out <file>` | Save the plan to a JSON file |
| `--provider <name>` | Override provider |

```bash
fluid plan contract.fluid.yaml --env staging
```

[Planning details →](./plan.md)

---

### `fluid apply`

Execute the contract: load data, run transformations, create cloud infrastructure.

```bash
fluid apply <contract-file> [options]
```

| Option | Description |
|--------|-------------|
| `--env <name>` | Environment overlay |
| `--yes` | Skip confirmation prompt |
| `--provider <name>` | Override provider |
| `--dry-run` | Show what would happen without executing |

```bash
fluid apply contract.fluid.yaml --yes                     # Local
fluid apply contract.fluid.yaml --provider gcp --env prod  # Cloud
```

[Full apply docs →](./apply.md)

---

### `fluid execute`

Run build jobs defined in the contract (manual or scheduled triggers).

```bash
fluid execute <contract-file> [--env <name>]
```

---

### `fluid verify`

Verify that deployed resources match the contract definition.

```bash
fluid verify <contract-file> [options]
```

| Option | Description |
|--------|-------------|
| `--provider <name>` | Target provider |
| `--strict` | Fail on any mismatch |

```bash
fluid verify contract.fluid.yaml --provider gcp
# ✅ All resources match contract definition
```

[Verify docs →](./verify.md)

---

## Code Generation & Export

### `fluid generate-airflow`

Generate a production-ready Airflow DAG from a contract. Supports GCP, AWS, and Snowflake.

```bash
fluid generate-airflow <contract-file> -o <output-file>
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path |
| `--env <name>` | Environment overlay |
| `--verbose` | Detailed generation logs |

```bash
fluid generate-airflow contract.fluid.yaml -o dags/pipeline.py
```

[Airflow generation guide →](./generate-airflow.md)

### `fluid export`

Universal export engine — generate Airflow, Dagster, or Prefect code.

```bash
fluid export <contract-file> --format <engine> -o <output-file>
```

| Format | Engine |
|--------|--------|
| `airflow` | Apache Airflow DAGs |
| `dagster` | Dagster pipelines with type-safe ops |
| `prefect` | Prefect flows with retry logic |

### `fluid export-opds`

Export a contract to OPDS (Open Data Product Specification) format.

```bash
fluid export-opds <contract-file> -o output.yaml
```

### `fluid odps`

Export to ODPS v4.1 (Linux Foundation Open Data Product Specification).

```bash
fluid odps <contract-file> [options]
```

### `fluid odcs`

Export to ODCS v3.1 (Open Data Contract Standard — Bitol.io).

```bash
fluid odcs <contract-file> [options]
```

---

## Visualization

### `fluid viz-graph`

Generate data lineage and dependency graphs.

```bash
fluid viz-graph <contract-file> [--out lineage.png]
```

Supports `.dot`, `.png`, and `.svg` output formats.

### `fluid viz-plan`

Interactive visualization of an execution plan.

```bash
fluid viz-plan <contract-file>
```

---

## Governance & Compliance

### `fluid policy-check`

Run governance and compliance checks against a contract.

```bash
fluid policy-check <contract-file> [options]
```

| Option | Description |
|--------|-------------|
| `--strict` | Treat warnings as errors |
| `--category <name>` | Filter: `sensitivity`, `access_control`, `data_quality`, `lifecycle` |
| `--format` | `rich`, `text`, or `json` |
| `--show-passed` | Include passed checks in output |

### `fluid policy-compile`

Compile `accessPolicy` declarations to provider-native IAM bindings.

```bash
fluid policy-compile <contract-file> --out runtime/policy/bindings.json
```

### `fluid policy-apply`

Enforce compiled governance rules on deployed resources.

```bash
fluid policy-apply runtime/policy/bindings.json --mode check    # Dry-run
fluid policy-apply runtime/policy/bindings.json --mode enforce  # Apply
```

### `fluid diff`

Detect configuration drift between the contract and deployed state.

```bash
fluid diff <contract-file> --provider gcp --exit-on-drift
# Exit code 0 = no drift, 1 = drift detected (ideal for CI/CD gates)
```

---

## Scaffolding & AI

### `fluid forge`

AI-powered project generation.

```bash
fluid forge [options]
```

| Option | Description |
|--------|-------------|
| `--mode <name>` | `copilot`, `agent`, `template`, `blueprint` |
| `--agent <name>` | Domain agent: `finance`, `healthcare`, `retail`, or custom |
| `--template <name>` | Named template |
| `--quickstart` | Use smart defaults |
| `--dry-run` | Preview without creating files |

```bash
fluid forge --mode copilot                    # AI-guided
fluid forge --template analytics --provider gcp  # From template
```

### `fluid copilot`

Launch the interactive AI assistant for guided data product creation.

### `fluid wizard`

Step-by-step guided setup for creating contracts.

### `fluid blueprint`

Work with reusable data product blueprints.

```bash
fluid blueprint list                                # Browse blueprints
fluid blueprint list --category analytics --provider gcp  # Filter
fluid blueprint describe customer-360-gcp            # Details
fluid blueprint create customer-360-gcp -d my-project    # Create
```

### `fluid scaffold-ci`

Generate CI/CD configuration for Jenkins, GitHub Actions, or GitLab CI.

---

## Marketplace & Publishing

### `fluid publish`

Publish a data product to a marketplace or catalog.

```bash
fluid publish <contract-file> [options]
```

### `fluid market`

Browse and discover data products from the marketplace.

### `fluid marketplace`

Extended marketplace browser with search and filtering.

---

## Utilities

### `fluid doctor`

Run system diagnostics: Python version, installed providers, cloud SDKs, credentials.

```bash
fluid doctor
```

### `fluid version`

Display version and build information.

```bash
fluid version
# Fluid Forge CLI v0.7.1
```

### `fluid providers`

List all discovered providers and their capabilities.

```bash
fluid providers
```

### `fluid auth`

Manage cloud provider authentication.

```bash
fluid auth login --provider gcp
fluid auth status
fluid auth logout
```

### `fluid context`

Get or set default provider, project, and region.

### `fluid preview`

Dry-run alias for `apply`. Preview what would happen without executing.

```bash
fluid preview contract.fluid.yaml
```

---

## Global Options

Available on every command:

| Option | Description | Env Variable |
|--------|-------------|-------------|
| `--provider <name>` | Cloud provider (`local`, `gcp`, `aws`, `snowflake`) | `FLUID_PROVIDER` |
| `--project <id>` | Cloud project or account ID | `FLUID_PROJECT` |
| `--region <name>` | Cloud region (default: `europe-west3`) | `FLUID_REGION` |
| `--log-level <level>` | `DEBUG`, `INFO`, `WARNING`, `ERROR` | `FLUID_LOG_LEVEL` |
| `--log-file <file>` | Write logs to file | `FLUID_LOG_FILE` |
| `--no-color` | Disable colored output | — |
| `--debug` | Enable debug mode | — |
| `--profile` | Performance profiling | — |
| `--safe-mode` | Enhanced security validations | — |

---

## Next Steps

- [Getting Started](/getting-started/) — install and run your first project
- [Local Walkthrough](/walkthrough/local) — develop locally with DuckDB
- [Provider Guides](/providers/) — GCP, AWS, Snowflake deep dives
- [Contributing](/contributing) — help improve Fluid Forge

---

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://fluidhq.io">Agentics Transformation Pty Ltd</a> · Open source under Apache 2.0</p>
