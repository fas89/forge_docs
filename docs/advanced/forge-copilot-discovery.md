# Forge Copilot Discovery Guide

This guide explains, step by step, how `fluid forge --mode copilot` discovers local context before it generates a production-ready FLUID contract.

## What Discovery Is For

Discovery gives copilot grounded local context so it can generate a better contract on the first attempt.

Instead of asking the LLM to guess your data shape, Forge scans local assets and sends a metadata summary such as:

- column names
- inferred column types
- SQL table references
- existing provider hints
- existing FLUID contract conventions

The goal is simple: better contract generation with less hallucination.

## Step 1: Install Copilot Discovery Helpers

Basic copilot works with the built-in LLM adapters alone. If you also want schema-aware discovery for Parquet and Avro files, install the optional discovery helpers:

```bash
pip install "fluid-forge[copilot]"
```

That extra installs:

- `pyarrow` for Parquet schema inspection
- `fastavro` for Avro schema inspection

You can also install them directly:

```bash
pip install pyarrow fastavro
```

If you skip these packages:

- CSV, JSON, JSONL, SQL, dbt, Terraform, README, and FLUID contract discovery still work
- Parquet and Avro files are still noticed
- Forge just cannot extract their schema metadata

## Step 2: Point Forge At The Right Files

Forge always scans the current workspace. Use `--discovery-path` when the most useful inputs live elsewhere or in a focused subdirectory.

Examples:

```bash
fluid forge --mode copilot --discovery-path ./data
fluid forge --mode copilot --discovery-path ../shared-schemas
```

Use `--no-discover` if you want copilot to rely only on interactive answers and explicit `--context`.

## Step 3: Understand What Forge Scans

Forge scans local files and directories and classifies them into discovery buckets.

### SQL Files

Forge extracts:

- referenced table names
- line counts

This helps copilot reuse naming conventions and source references already in the repo.

### dbt Projects

Forge extracts:

- project name
- profile name
- model paths
- provider hints from config text

### Terraform Files

Forge extracts:

- resource types
- resource names
- provider hints such as GCP, AWS, or Snowflake

### README Files

Forge extracts:

- headings
- approximate word count

It does not send the full README body.

### Existing FLUID Contracts

Forge extracts:

- FLUID version
- contract kind
- contract id and name
- build ids
- expose ids
- provider bindings

This helps copilot stay consistent with the patterns already used in the codebase.

### Sample Data Files

Forge supports these local sample formats:

- CSV
- JSON
- JSONL
- Parquet
- Avro

## Step 4: What Forge Extracts From Each Sample Format

### CSV

Forge reads a small number of rows locally and derives:

- column names
- inferred scalar types such as `integer`, `number`, `boolean`, `date`, `datetime`, `string`

Forge does not send the row values themselves.

### JSON And JSONL

Forge reads a bounded local sample and derives:

- top-level keys
- inferred types from observed values

It supports object arrays, JSONL rows, and simple columnar JSON shapes.

### Parquet

Forge inspects Parquet schema metadata locally.

When `pyarrow` is available, Forge extracts:

- column names
- logical types from the Parquet schema
- row count from file metadata when available

When `duckdb` is available but `pyarrow` is not, Forge can still infer:

- column names
- approximate logical types from `DESCRIBE read_parquet(...)`

Forge does not read and upload Parquet rows to the LLM.

### Avro

Forge inspects Avro schema metadata locally.

When `fastavro` is available, Forge extracts:

- field names
- top-level field types
- logical types such as `date` and `timestamp`

When the classic `avro` package is available, Forge can also read the writer schema.

Forge does not upload Avro records to the LLM.

## Step 5: Privacy Boundary

This is the most important rule in the discovery pipeline:

Forge sends metadata summaries only.

Forge does **not** send:

- raw sample rows
- full file contents
- bearer tokens
- API keys
- passwords
- service-account JSON blobs

Examples of data that may be sent:

- `"columns": {"customer_id": "integer", "created_at": "datetime"}`
- `"referenced_tables": ["raw.orders", "raw.customers"]`

Examples of data that are not sent:

- actual customer email addresses from CSV rows
- full SQL statements
- full README paragraphs
- raw Parquet or Avro payload data

## Step 6: How Discovery Feeds Generation

After discovery, Forge builds a normalized `DiscoveryReport` and sends that metadata to the selected LLM adapter together with:

- your interactive answers
- project-scoped memory when `runtime/.state/copilot-memory.json` exists and memory is enabled
- the local capability matrix
- a seed FLUID contract
- repair feedback from any previous failed attempt

The LLM is asked to return:

- a full FLUID contract
- README content
- any extra text files needed for scaffolding
- template/provider recommendations

If saved project memory and the current discovery report conflict, Forge prefers the current discovery report.

## Step 7: Validation And Repair

Once the LLM returns a draft, Forge validates it locally.

Validation checks include:

- FLUID schema validation
- supported template name
- supported provider name
- provider/build engine compatibility
- required build fields
- required expose bindings

If validation fails:

1. Forge collects the validation errors
2. sends those errors back to the LLM
3. asks for a repaired contract
4. retries up to 3 total attempts

If all attempts fail, Forge exits non-zero and writes no project files.

## Step 8: Scaffolding Only After Success

If validation succeeds, Forge uses the validated contract as the source of truth and then writes:

- `contract.fluid.yaml`
- `README.md`
- `requirements.txt`
- provider config stubs

## Related Guide

To see how successful runs can influence later copilot generations, see [Forge Copilot Memory Guide](./forge-copilot-memory.md).
- helper scripts
- any additional safe text files returned by copilot

This means downstream commands like these start from a validated contract:

```bash
fluid validate contract.fluid.yaml
fluid plan contract.fluid.yaml --out runtime/plan.json
fluid apply contract.fluid.yaml --yes
fluid execute contract.fluid.yaml
```

## Step 9: Typical Commands

OpenAI with focused discovery:

```bash
export OPENAI_API_KEY=sk-...
fluid forge --mode copilot \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --discovery-path ./data
```

Ollama with local discovery:

```bash
export OLLAMA_HOST=http://localhost:11434
fluid forge --mode copilot \
  --llm-provider ollama \
  --llm-model llama3.1 \
  --llm-endpoint http://localhost:11434/v1/chat/completions \
  --discovery-path ./samples
```

## Step 10: Troubleshooting

### Parquet files are discovered but columns are empty

Install one of these local readers:

```bash
pip install pyarrow
```

Or:

```bash
pip install duckdb
```

### Avro files are discovered but fields are empty

Install:

```bash
pip install fastavro
```

Or:

```bash
pip install avro
```

### I don’t want Forge to scan my workspace

Use:

```bash
fluid forge --mode copilot --no-discover
```

### I only want a specific subdirectory scanned

Use:

```bash
fluid forge --mode copilot --discovery-path ./exact-folder
```

## Related Guides

- [Built-in and custom LLM agents](./custom-llm-agents.md)
