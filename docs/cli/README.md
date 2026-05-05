# CLI Reference

Fluid Forge ships with 45 top-level commands organized into functional categories. Run `fluid --help` for the full list or `fluid <command> -h` for per-command details.

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
| Publish to DataMesh Manager | `fluid datamesh-manager publish contract.fluid.yaml` |
| Run build jobs | `fluid execute contract.fluid.yaml` |
| Detect drift | `fluid diff contract.fluid.yaml` |
| Visualize lineage | `fluid viz-graph contract.fluid.yaml` |
| Generate Airflow DAG | `fluid generate-airflow contract.fluid.yaml -o dag.py` |
| Check governance | `fluid policy-check contract.fluid.yaml` |
| AI-guided creation | `fluid forge --mode copilot` |
| System diagnostics | `fluid doctor` |

---

## `fluid forge`

`fluid forge --mode copilot` is the primary AI-backed project creation flow.

What it does:

1. starts with a lightweight interview and asks only the follow-up questions needed for the current scenario
2. accepts natural-language answers, short phrases, numbers, and fuzzy wording instead of forcing exact option matches
3. discovers local metadata from SQL, dbt, Terraform, README files, existing FLUID contracts, and sample files
4. optionally loads project-scoped memory from `runtime/.state/copilot-memory.json`
5. asks the selected LLM to generate a full FLUID contract, README, and any additional scaffold files
6. validates and repairs the contract locally, retrying up to 3 generation attempts
7. in interactive mode, can ask one final clarification round if generation failed because intent was still ambiguous
8. scaffolds the project only if validation passes, then shows official `fluid validate`, `fluid plan`, and `fluid apply` next steps

Common use-case categories in the interactive flow are:

- `Analytics & BI`
- `ETL / Data Pipelines`
- `Streaming / Real-time`
- `ML / Feature Engineering`
- `Data Platform / Lakehouse`
- `Other / Not sure`

You can still answer with your own wording such as `CDC sync`, `executive scorecards`, or `customer 360`.

Built-in domain-agent mode is also available through `fluid forge --mode agent`. The current built-in agents are:

- `finance` for regulated analytics, fraud, trading, and compliance-heavy data products
- `healthcare` for HIPAA-aware analytics, PHI handling, and clinical workflows
- `retail` for customer 360, personalization, demand, and inventory use cases
- `telco` for TM Forum SID-aligned OSS/BSS, service assurance, and network-operations analytics

These built-in agents are backed by declarative YAML specs, so they share the same Forge scaffolding engine while applying domain-specific questions, defaults, rules, and next-step guidance.

Key copilot flags: `--llm-provider`, `--llm-model`, `--discovery-path`, `--context`, `--memory` / `--no-memory`, `--interactive` / `--non-interactive`, `--dry-run`. See the full flag table in the [`fluid forge` command reference](#fluid-forge-1) below.

Typical examples:

```bash
export OPENAI_API_KEY=sk-...
fluid forge
```

```bash
fluid forge --mode copilot \
  --context ./copilot-context.json \
  --discovery-path ./data \
  --llm-provider openai \
  --llm-model gpt-4o-mini
```

```bash
fluid forge --mode copilot \
  --non-interactive \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --save-memory
```

```bash
fluid forge --show-memory
fluid forge --reset-memory
```

```bash
fluid forge --mode agent --agent telco
fluid forge --mode agent --agent finance
```

Step-by-step guides:

- [Forge Copilot Discovery Guide →](../advanced/forge-copilot-discovery.md)
- [Forge Copilot Memory Guide →](../advanced/forge-copilot-memory.md)

---

## Core Workflow

These four commands form the standard development loop: **init → validate → plan → apply**.

### `fluid init`

Create a new Fluid Forge project with sample data and a working contract. If the target directory does not exist yet, `fluid init` creates it before copying the selected template.

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
fluid odps export <contract-file> [options]
fluid odps validate <odps-file> [options]
fluid odps info
```

ODPS export metadata comes from the contract itself: provider/type fields are derived from `binding.platform`, expose kind falls back from `kind` to `type`, and product metadata uses the documented exporter precedence in the [provider guide](../providers/README.md).

### `fluid odcs`

Export to ODCS v3.1 (Open Data Contract Standard — Bitol.io).

```bash
fluid odcs <contract-file> [options]
```

### `fluid datamesh-manager`

Publish a data product to Entropy Data / DataMesh Manager.

```bash
fluid datamesh-manager publish <contract-file> [options]
fluid dmm publish <contract-file> [options]
```

DataMesh Manager publish uses the same contract-driven metadata rules as the providers: `binding.platform` is preferred over legacy provider keys, expose kind falls back from `kind` to `type`, and tags merge top-level `tags` with `metadata.tags`.

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

LLM-backed project generation and scaffolding.

```bash
fluid forge [options]
```

`fluid forge --mode copilot` now runs an adaptive flow:

1. Bootstrap the run from CLI flags, `--context`, local discovery, and optional project memory
2. Ask only the minimum follow-up questions needed for the current scenario
3. Accept free-text answers with soft matching for suggested options
4. Generate a full production-ready `contract.fluid.yaml`
5. Validate and repair the contract up to 3 times
6. If interactive generation failed because intent was still ambiguous, ask one more clarification round and retry once
7. Scaffold the project only after the contract passes validation
8. If built-in provider inspection or provider setup is incomplete, surface a warning and continue so you can review the provider later

| Option | Description |
|--------|-------------|
| `--mode <name>` | `copilot`, `agent`, `template`, `blueprint` |
| `--agent <name>` | Domain agent: `finance`, `healthcare`, `retail`, `telco`, or a registered custom agent |
| `--template <name>` | Named template |
| `--provider <name>` | Provider hint for the generated project |
| `--llm-provider <name>` | Built-in LLM adapter: `openai`, `anthropic` (`claude` alias), `gemini`, `ollama` |
| `--llm-model <name>` | Model identifier for the selected adapter |
| `--llm-endpoint <url>` | Exact HTTP endpoint override for the selected adapter |
| `--discover` / `--no-discover` | Enable or disable local metadata discovery |
| `--discovery-path <path>` | Extra local file or directory to scan for metadata |
| `--context <json-or-file>` | Additional structured context for copilot mode |
| `--interactive` / `--non-interactive` | Force prompts on or off |
| `--memory` / `--no-memory` | Enable or disable loading repo-local copilot memory |
| `--save-memory` | Persist repo-local copilot memory after a successful non-interactive run |
| `--show-memory` | Show the current project-scoped copilot memory summary and exit |
| `--reset-memory` | Delete the current project-scoped copilot memory file and exit |
| `--quickstart` | Use smart defaults |
| `--dry-run` | Preview without creating files |

```bash
export OPENAI_API_KEY=sk-...
fluid forge

fluid forge --mode copilot --llm-provider openai --llm-model gpt-4o-mini

fluid forge --mode copilot --llm-provider ollama \
  --llm-model llama3.1 \
  --llm-endpoint http://localhost:11434/v1/chat/completions

fluid forge --mode copilot --discovery-path ./data
fluid forge --show-memory
fluid forge --template analytics --provider gcp
fluid forge --mode agent --agent telco
```

Credential resolution:

- Provider, model, and endpoint use `CLI flags > FLUID_LLM_* > built-in defaults`
- API keys use `FLUID_LLM_API_KEY` first, then provider-specific variables such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `GOOGLE_API_KEY`
- Ollama uses no API key by default

Important behavior:

- Secrets are environment-variable only. There is no `--llm-api-key` flag.
- `--llm-endpoint` is an exact endpoint override for proxies, self-hosted gateways, or Ollama. It is not a file-upload target.
- `--discovery-path` scans local files and sends only derived metadata to the LLM, never raw sample rows or full file contents.
- Discovery supports SQL, dbt, Terraform, README headings, existing FLUID contracts, and sample files including CSV, JSON, JSONL, Parquet, and Avro.
- `--mode agent` uses the same shared Forge scaffolding path as copilot mode, but seeds it with domain-specific declarative rules and next-step guidance.
- Interactive prompts are friendly by default: suggested options are hints, not strict menus.
- Copilot keeps an app-managed interview summary and transcript so provider behavior stays consistent across OpenAI, Anthropic, Gemini, and Ollama.
- Built-in provider checks for `local`, `gcp`, `aws`, and `snowflake` are best-effort during copilot preparation. If local inspection fails, Forge warns and keeps going with safe defaults instead of aborting.
- If copilot scaffolds a cloud-oriented project before provider credentials are fully configured, Forge now shows a warning instead of failing project creation. Finish provider setup before `fluid plan` or `fluid apply`.
- `fluid doctor` is the quickest way to sanity-check provider tooling and credentials after scaffolding.
- The public scaffolding path is `fluid forge --mode copilot`.

[Advanced LLM setup →](../advanced/custom-llm-agents.md)
[Step-by-step discovery guide →](../advanced/forge-copilot-discovery.md)

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
# Fluid Forge CLI v0.7.7
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

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://github.com/Agentics-Rising">Agentics Transformation Pty Ltd</a> · Open source under Apache 2.0</p>
