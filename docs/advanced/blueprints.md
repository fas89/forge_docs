# Blueprints

Reusable, parameterized templates for common data product patterns. Blueprints let you scaffold a complete project — contract, sample data, transformations — in seconds.

::: warning Command renamed in v0.8.0
The dedicated `fluid blueprint` subcommand was retired in v0.8.0. The same workflows are now split between two existing commands:

- **Browse / discover blueprints** → `fluid market --blueprints`
- **Create a project from a template/blueprint** → `fluid init <name> --template <blueprint>`
- **List local templates only** → `fluid init --list-templates`

If you have automation that calls `fluid blueprint …`, see the [migration table](#migrating-from-fluid-blueprint) at the bottom of this page.
:::

## Quick Start

```bash
# 1. Browse blueprints in the marketplace
fluid market --blueprints

# 2. Search for a specific pattern
fluid market --search customer-360 --blueprints

# 3. List local templates that ship with the CLI
fluid init --list-templates

# 4. Create a project from a template (or blueprint)
fluid init my-project --template customer-360 --provider gcp

# 5. Run the standard workflow
cd my-project
fluid validate contract.fluid.yaml
fluid apply contract.fluid.yaml --yes
```

## Discovering blueprints

`fluid market --blueprints` searches the marketplace catalog (Agentics-Rising's curated set + your org's private catalogs if configured).

```bash
fluid market --blueprints                        # all blueprints
fluid market --blueprints --domain customer      # filter by domain
fluid market --blueprints --tags analytics       # filter by tag
fluid market --search customer-360 --blueprints  # text search across names/descriptions
```

See the full set of `--filter` flags in [`fluid market --help`](/cli/) — `--domain`, `--owner`, `--layer`, `--status`, `--tags`, `--min-quality`, `--created-after`/`--created-before` are all supported.

## Creating a project from a blueprint

The canonical creation path in v0.8.0 is `fluid init` with `--template`:

```bash
fluid init my-analytics --template customer-360 --provider gcp
```

| Option | Description |
|--------|-------------|
| `--template <name>` | Name of the template/blueprint (e.g. `customer-360`, `ml-features`) |
| `--provider <name>` | Override the default provider (`local`, `gcp`, `aws`, `snowflake`) |
| `--quickstart` | Add sample data + a runnable contract on top of the template |
| `--blank` | Empty contract on the template's structure (for power users) |
| `--list-templates` | List available local templates and exit |
| `--dir <path>`, `-C` | Target directory (default: current working dir) |
| `--dry-run` | Preview what would be created without doing it |
| `--yes`, `-y` | Skip confirmation prompts |

::: tip Local templates vs marketplace blueprints
The CLI ships with a handful of **local templates** (`customer-360`, `ml-features`, `hello-world`) — see `fluid init --list-templates`. Marketplace **blueprints** are the broader set discoverable via `fluid market --blueprints`. Both are referenced by `--template <name>`; the CLI checks local templates first, then the marketplace.
:::

## Available templates (shipped with the CLI)

| Template | Category | Providers | Description |
|----------|----------|-----------|-------------|
| `customer-360` | Analytics | local | Customer analytics data product |
| `customer-360-gcp` | Analytics | gcp | Customer analytics on BigQuery |
| `enterprise-snowflake` | Analytics | snowflake | Enterprise data warehouse |
| `semantic-customer-model` | Analytics | local | Semantic layer with customer data |

Run `fluid init --list-templates` for the up-to-date set on your installed CLI version. Marketplace blueprints (curated by Agentics-Rising and the community) are listed separately via `fluid market --blueprints`.

## Migrating from `fluid blueprint`

If you have scripts/CI that still call `fluid blueprint …`, here's the canonical replacement for each subcommand:

| v0.7.x command | v0.8.0 equivalent |
|----------------|-------------------|
| `fluid blueprint list` | `fluid market --blueprints` (marketplace) **or** `fluid init --list-templates` (local) |
| `fluid blueprint list --category analytics --provider gcp` | `fluid market --blueprints --layer analytical` |
| `fluid blueprint describe <name>` | `fluid market --search <name> --blueprints` |
| `fluid blueprint create <name> --target-dir d` | `fluid init d --template <name>` |
| `fluid blueprint create <name> --quickstart` | `fluid init my-proj --template <name> --quickstart` |
| `fluid blueprint search <query>` | `fluid market --search <query> --blueprints` |
| `fluid blueprint validate [name]` | Folded into `fluid validate` once a project is scaffolded |

## See also

- [`fluid init`](/cli/init) — create projects from scratch, with `--quickstart`, `--blank`, or `--template`
- [`fluid forge`](/cli/) — AI-powered project generation when you don't have a clear template in mind
- [`fluid market`](/cli/) — discover data products and blueprints from the marketplace
- [Getting Started](/getting-started/) — install and run your first project
- [Custom LLM Agents](/advanced/custom-llm-agents) — AI-powered project generation with your own models
- [Contributing](/contributing) — contribute new templates and blueprints
