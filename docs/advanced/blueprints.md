# Blueprints

Reusable, parameterized templates for common data product patterns. Blueprints are Jinja2 templates that generate a complete FLUID contract — letting you scaffold a working data product in seconds instead of writing one from scratch.

Blueprints live in the FLUID blueprint marketplace and are accessed through the `fluid market` command. The `--blueprints` flag switches `fluid market` from searching enterprise data catalogs to searching marketplace blueprint templates.

## Quick Start

```bash
# List all available blueprints
fluid market --blueprints

# Search blueprints by keyword
fluid market --blueprints --search analytics

# Show details for a specific blueprint
fluid market --blueprint-id customer-360-etl

# Generate a contract from a blueprint
fluid market --blueprint-id customer-360-etl --instantiate
```

## CLI Reference

Blueprints are a mode of `fluid market`. Three flags control blueprint behavior:

| Option | Description |
|--------|-------------|
| `--blueprints` | Search the blueprint marketplace instead of data catalogs |
| `--blueprint-id <id>` | Inspect a specific blueprint, or instantiate it |
| `--instantiate` | Generate a FLUID contract from the blueprint (requires `--blueprint-id`) |

These combine with the standard `fluid market` flags. The ones relevant to blueprints are:

| Option | Description |
|--------|-------------|
| `--search`, `-s` | Keyword text to search blueprint names and descriptions |
| `--limit` | Maximum number of results (default: 50) |
| `--format`, `-f` | Output format (`table`, `json`, `detailed`) |

### Searching blueprints

`fluid market --blueprints` lists marketplace blueprints. Add `--search` to filter by keyword:

```bash
fluid market --blueprints --search "customer analytics"
```

Results show each blueprint's ID, name, category, maturity, download count, and version.

### Inspecting a blueprint

`fluid market --blueprint-id <id>` shows detailed information about a blueprint, including its description, maturity, author, license, and the full list of parameters it accepts — with each parameter's type and whether it is required.

```bash
fluid market --blueprint-id customer-360-etl
```

### Instantiating a blueprint

`fluid market --blueprint-id <id> --instantiate` renders the blueprint's Jinja2 template into a FLUID contract. The blueprint's parameters are collected through an interactive wizard, and the generated contract is validated before being returned.

```bash
fluid market --blueprint-id customer-360-etl --instantiate
```

Note: `--instantiate` requires `--blueprint-id`. Running `--instantiate` on its own returns an error.

## Creating From a Blueprint

```bash
# 1. Browse options
fluid market --blueprints

# 2. Inspect one to see its parameters
fluid market --blueprint-id customer-360-etl

# 3. Generate a contract from it
fluid market --blueprint-id customer-360-etl --instantiate

# 4. Run the standard workflow on the generated contract
fluid validate contract.fluid.yaml
fluid apply contract.fluid.yaml --yes
```

## See Also

- [market command](/forge_docs/cli/market) — full reference for `fluid market`
- [init command](/forge_docs/cli/init) — create projects from scratch
- [forge command](/forge_docs/cli/) — AI-powered project generation
- [Getting Started](/forge_docs/getting-started/) — install and run your first project
- [Custom LLM Agents](/forge_docs/advanced/custom-llm-agents) — AI-powered project generation with your own models
- [Contributing](/forge_docs/contributing) — contribute new blueprints
