# init Command

Create a new FLUID project with contracts, sample data, and a ready-to-run pipeline.

## Syntax

```bash
fluid init [name] [options]
```

## Options

### Project Mode (mutually exclusive)

| Option | Description |
|--------|-------------|
| `--quickstart` | Create a working example with sample data **(recommended, ~2 min)** |
| `--blank` | Empty project skeleton (power users) |
| `--template <name>` | Start from a named template (e.g. `customer-360`, `ml-features`) |
| `--list-templates` | List available templates and exit |
| `--agent <name>` | Scaffold a custom domain agent spec in `.fluid/agents/` |

::: tip Need an interactive guided setup?
That used to be `fluid init --wizard`. In v0.8.0 it's the AI-assisted [`fluid forge`](#fluid-forge) command — runs an interview, asks for domain context, and produces a tailored contract. Or run `fluid init my-project` (no flag) and it prompts you through the same flow.
:::

### Additional Options

| Option | Description | Default |
|--------|-------------|---------|
| `--provider <name>` | Target provider: `local`, `gcp`, `aws`, `snowflake`, `azure` | `local` |
| `--use-case <type>` | Project type: `data-product`, `ai-agent`, `analytics`, `api` | — |
| `--no-run` | Don't auto-execute the pipeline after creation | `false` |
| `--no-dag` | Don't auto-generate an Airflow DAG | `false` |
| `--dry-run` | Preview what would be created without writing files | `false` |
| `--yes`, `-y` | Skip confirmation prompts | `false` |

## What It Creates

`fluid init my-project --quickstart` creates the `my-project/` directory for you and then copies the current quickstart scaffold into it. The default quickstart project looks like:

```
my-project/
├── README.md              # Template walkthrough and next steps
├── contract.fluid.yaml    # Data product contract
├── data/
│   ├── customers.csv
│   ├── interactions.csv
│   └── orders.csv
└── .fluid/
    └── db.duckdb          # Local DuckDB state created during init
```

## Examples

### Quickstart (Recommended)

```bash
fluid init bitcoin-tracker --quickstart
```

Creates the `bitcoin-tracker/` directory and fills it with a fully working project you can run immediately:

```bash
cd bitcoin-tracker
fluid validate contract.fluid.yaml
fluid apply contract.fluid.yaml --yes
```

### Scan Existing dbt Project

```bash
cd existing-dbt-project
fluid import .
```

Auto-detects dbt models and converts them into a FLUID contract.

### GCP-Targeted Project

```bash
fluid init analytics --provider gcp --quickstart
```

Generates a contract configured for BigQuery deployment.

### Blank Skeleton

```bash
fluid init my-project --blank
```

Creates a minimal project with an empty contract template.

### Preview Mode

```bash
fluid init my-project --quickstart --dry-run
```

Shows what files and directories would be created, including the target project directory, without writing anything.

## After Initialization

Once your project is created, follow the standard workflow:

```bash
# 1. Move into the project directory
cd my-project

# 2. Validate the contract
fluid validate contract.fluid.yaml

# 3. Deploy locally (or to cloud)
fluid apply contract.fluid.yaml --yes
```

## See Also

- [Getting Started Guide](/getting-started/) — end-to-end first project walkthrough
- [validate command](./validate.md) — validate your contract
- [apply command](./apply.md) — deploy your project
