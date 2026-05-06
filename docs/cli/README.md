# CLI Reference

Fluid Forge v0.8.0 ships with ~29 commands organized into functional categories — Core Workflow, Generate, Integrations, Pipeline Stages, Quality & Governance, Safety & Supply Chain, and Utilities. Run `fluid --help` for the full list or `fluid <command> -h` for per-command details. The taxonomy below mirrors the actual `fluid --help` output.

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
| Detect drift | `fluid diff contract.fluid.yaml` |
| Visualize lineage | `fluid graph contract.fluid.yaml` |
| Generate Airflow DAG | `fluid generate schedule contract.fluid.yaml -o dag.py` |
| Check governance | `fluid policy-check contract.fluid.yaml` |
| AI-guided creation | `fluid forge` |
| System diagnostics | `fluid doctor` |

---

## `fluid forge`

`fluid forge` is the primary AI-backed project creation flow in v0.8.0.

What it does:

1. starts with a lightweight interview and asks only the follow-up questions needed for the current scenario
2. accepts natural-language answers, short phrases, numbers, and fuzzy wording instead of forcing exact option matches
3. discovers local metadata from SQL, dbt, Terraform, README files, existing FLUID contracts, and sample files (toggle with `--discover` / `--no-discover` / `--discovery-path`)
4. optionally loads project-scoped memory from `runtime/.state/copilot-memory.json` (`--memory` / `--no-memory` / `--save-memory` / `--show-memory` / `--reset-memory`)
5. asks the selected LLM to generate a full FLUID contract, README, and any additional scaffold files
6. validates and repairs the contract locally, retrying up to 3 generation attempts
7. asks one final clarification round if generation failed because intent was still ambiguous (interactive mode only)
8. scaffolds the project only if validation passes, then shows official `fluid validate`, `fluid plan`, and `fluid apply` next steps

### Domain hints

Instead of `--mode agent --agent <name>` (v0.7.x), v0.8.0 takes a `--domain` flag that biases the LLM with domain-specific questions, defaults, rules, and next-step guidance:

- `--domain finance` — regulated analytics, fraud, trading, compliance-heavy data products
- `--domain healthcare` — HIPAA-aware analytics, PHI handling, clinical workflows
- `--domain retail` — customer 360, personalization, demand, inventory
- `--domain telco` — TM Forum SID-aligned OSS/BSS, service assurance, network-operations analytics

You can also bring your own domain agent with `fluid init --agent <name>`, which scaffolds a custom spec under `.fluid/agents/`.

### Flags (v0.8.0)

`--target-dir`, `--provider`, `--domain`, `--blank`, `--dry-run`, `--non-interactive`, `--context`, `--llm-provider`, `--llm-model`, `--llm-endpoint`, `--discover` / `--no-discover` / `--discovery-path`, `--memory` / `--no-memory` / `--save-memory` / `--show-memory` / `--reset-memory`. Full reference: `fluid forge -h`.

::: warning v0.7.x flags removed
`--mode copilot` (the AI flow is now the default), `--mode agent` (replaced by `--domain`), `--interactive` (default; use `--non-interactive` to opt out), and `--agent <name>` on forge (moved to `fluid init --agent`) all returned errors in v0.8.0.
:::

### Typical examples

```bash
export OPENAI_API_KEY=sk-...
fluid forge
```

```bash
fluid forge \
  --context ./copilot-context.json \
  --discovery-path ./data \
  --llm-provider openai \
  --llm-model gpt-4o-mini
```

```bash
fluid forge \
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
# Domain-biased generation (replaces --mode agent --agent <name>)
fluid forge --domain telco
fluid forge --domain finance --provider gcp
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
| `--blank` | Empty project skeleton (power users) |
| `--provider <name>` | Target provider: `local` (default), `gcp`, `aws`, `snowflake` |
| `--template <name>` | Start from a named template (e.g. `customer-360`) |
| `--list-templates` | List available templates and exit |
| `--agent <name>` | Scaffold a custom domain agent spec in `.fluid/agents/` |
| `--dir <path>`, `-C` | Target directory (default: current working dir) |
| `--dry-run` | Preview what would be created |
| `--yes`, `-y` | Skip confirmation prompts |
| `--quiet`, `-q` | Suppress the next-steps panel |

::: tip `--wizard` / `--scan` are gone in v0.8.0
For interactive AI-assisted setup, run [`fluid forge`](#fluid-forge) — it does an interview, scans your local files, and produces a tailored contract. The `--scan` import-from-existing flow moved to [`fluid import`](#fluid-import).
:::

```bash
fluid init my-project --quickstart                # Quick start (recommended)
fluid init analytics --provider gcp --quickstart  # GCP-targeted project
fluid init --list-templates                       # See available templates
fluid import ./my-dbt-project                     # Import an existing dbt project (was --scan)
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

::: warning `fluid execute` is gone in v0.8.0
Earlier versions had a separate `fluid execute` for "run build jobs without provisioning." That's now folded into `fluid apply` — use `fluid apply --mode amend-and-build` to refresh transforms without re-creating tables, or `fluid apply --dry-run` to render without making warehouse calls. See [`apply` docs](./apply.md) for the full `--mode` matrix.
:::

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

### `fluid generate schedule`

Generate a production-ready Airflow DAG from a contract. Supports GCP, AWS, and Snowflake.

```bash
fluid generate schedule <contract-file> -o <output-file>
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path |
| `--env <name>` | Environment overlay |
| `--verbose` | Detailed generation logs |

```bash
fluid generate schedule contract.fluid.yaml -o dags/pipeline.py
```

[Airflow generation guide →](./generate-schedule.md)

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

### `fluid graph`

Generate data lineage and dependency graphs.

```bash
fluid graph <contract-file> [--out lineage.png]
```

Supports `.dot`, `.png`, and `.svg` output formats.

### `fluid plan --html`

Interactive visualization of an execution plan.

```bash
fluid plan --html <contract-file>
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

### `fluid policy-apply --mode check`

Compile `accessPolicy` declarations to provider-native IAM bindings.

```bash
fluid policy-apply --mode check <contract-file> --out runtime/policy/bindings.json
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

`fluid forge` now runs an adaptive flow:

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
| `--target-dir <path>`, `-d` | Target directory for the generated project |
| `--provider <name>`, `-p` | Provider hint: `local` (default), `gcp`, `aws`, `snowflake` |
| `--domain <name>` | Domain hint: `finance`, `healthcare`, `retail`, `telco` (replaces `--mode agent --agent <name>` from v0.7.x) |
| `--blank` | Create an empty contract without invoking the LLM |
| `--dry-run` | Preview without creating files |
| `--non-interactive` | Run without prompts |
| `--context <json-or-file>` | Additional structured context for the AI flow |
| `--llm-provider <name>` | LLM adapter: `openai`, `anthropic` (`claude` alias), `gemini`, `ollama` |
| `--llm-model <name>` | Model identifier for the selected adapter |
| `--llm-endpoint <url>` | HTTP endpoint override for the selected adapter |
| `--discover` / `--no-discover` | Enable or disable local metadata discovery (default: enabled) |
| `--discovery-path <path>` | Extra local file or directory to scan for metadata |
| `--memory` / `--no-memory` | Enable or disable loading repo-local copilot memory |
| `--save-memory` | Persist repo-local copilot memory after a successful run |
| `--show-memory` | Show the current project-scoped copilot memory summary and exit |
| `--reset-memory` | Delete the current project-scoped copilot memory file and exit |
| `--quickstart` | Use smart defaults |
| `--dry-run` | Preview without creating files |

```bash
export OPENAI_API_KEY=sk-...
fluid forge

fluid forge --llm-provider openai --llm-model gpt-4o-mini

fluid forge --llm-provider ollama \
  --llm-model llama3.1 \
  --llm-endpoint http://localhost:11434/v1/chat/completions

fluid forge --discovery-path ./data
fluid forge --show-memory
fluid forge --provider gcp
fluid forge --domain telco
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
- The public scaffolding path is `fluid forge`.

[Advanced LLM setup →](../advanced/custom-llm-agents.md)
[Step-by-step discovery guide →](../advanced/forge-copilot-discovery.md)

::: warning `fluid wizard` is gone in v0.8.0
The interactive guided-setup command was retired. The replacement flows are:
- **AI-powered guided creation** → `fluid forge` (above) — runs an LLM-assisted interview, scans local files, produces a tailored contract.
- **Plain interactive setup** → `fluid init my-project` (no flags) — same prompt-driven flow without AI.
- **Browse + scaffold from a template** → `fluid init <name> --template <blueprint>`.
:::

### `fluid init --template <name>` (replaces `fluid blueprint`)

Browse and create from blueprints — what `fluid blueprint` used to do, split across two existing commands in v0.8.0:

```bash
fluid init --list-templates                                # Local templates shipped with CLI
fluid market --blueprints                                  # Marketplace blueprints
fluid market --blueprints --domain customer                # Filter by domain
fluid market --search customer-360 --blueprints            # Text search
fluid init my-project --template customer-360-gcp          # Scaffold from a template/blueprint
```

See [Blueprints →](/advanced/blueprints) for the full migration table.

### `fluid generate ci` (was `scaffold-ci`)

Generate CI/CD configuration for GitHub Actions, GitLab CI, Jenkins, Azure, Bitbucket, CircleCI, or Tekton:

```bash
fluid generate ci contract.fluid.yaml --target github      # GitHub Actions
fluid generate ci contract.fluid.yaml --target gitlab      # GitLab CI
fluid generate ci contract.fluid.yaml --target jenkins     # Jenkinsfile
```

---

## Marketplace & Publishing

### `fluid publish`

Publish a data product to enterprise data catalogs.

```bash
fluid publish <contract-file> [--target <catalog>]
```

`--target` can be repeated for multi-catalog publication.

### `fluid market`

Browse and discover data products + blueprints across enterprise catalogs and marketplaces.

```bash
fluid market                              # All registered products
fluid market --blueprints                 # Reusable templates only
fluid market --search customer            # Text search across name/description/tags
fluid market --domain customer --layer gold  # Filter by domain + layer
```

Filter flags: `--search`, `--domain`, `--owner`, `--layer`, `--status`, `--tags`, `--min-quality`, `--created-after`, `--created-before`. See `fluid market -h` for the full list.

### `fluid import`

Import an existing dbt / Terraform / SQL project into a Fluid contract:

```bash
fluid import ./my-dbt-project              # Auto-detect dbt
fluid import ./my-tf-project --kind terraform
```

Use this when migrating existing infrastructure rather than starting from scratch.

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
# FLUID CLI v0.8.0
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
