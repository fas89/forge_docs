# Forge Copilot Memory Guide

This guide explains, step by step, how project-scoped memory works for `fluid forge` inside the new adaptive copilot flow.

## What Copilot Memory Is

Copilot memory is a small repo-local file that helps Forge remember successful project conventions from earlier copilot runs.

The file lives here inside the project:

```text
runtime/.state/copilot-memory.json
```

It is:

- project-scoped, not user-global
- private to the repo
- structured and bounded
- advisory only

It is **not** a bypass around validation. Forge still validates every generated contract before scaffolding.

## The Short Version

1. You run `fluid forge`.
2. Forge loads `runtime/.state/copilot-memory.json` if it exists, unless you pass `--no-memory`.
3. Forge combines:
   - your explicit CLI flags and current-run answers
   - current local discovery results
   - saved project memory
   - safe defaults
4. Forge uses that combined picture to drive the adaptive interview and generation prompts.
5. Forge shows whether memory was loaded and summarizes what it remembers.
6. Forge sends a bounded `project_memory` summary to the LLM together with the current discovery report.
7. Forge explains whether seed template/provider guidance came from explicit input, current discovery, saved memory, or defaults.
8. Forge validates and repairs the generated contract.
9. Forge scaffolds only if validation passes.
10. Forge saves memory only if you explicitly opt in:
   - interactive mode: Forge asks after a successful scaffold
   - non-interactive mode: you must pass `--save-memory`

## Step 1: Run Copilot Normally

Start the same way you already use copilot:

```bash
export OPENAI_API_KEY=sk-...
fluid forge \
  --llm-provider openai \
  --llm-model gpt-4o-mini
```

If memory already exists in the current project, Forge loads it by default.

When it does, Forge now tells you that directly in the copilot flow and shows a short summary of the remembered profile, build conventions, and summary counts.

If you want to ignore it for one run:

```bash
fluid forge --no-memory
```

## Step 2: Understand What Forge Loads

When memory exists, Forge loads a structured summary such as:

- last successful template
- last successful provider
- preferred domain and owner team
- previously successful build engines
- expose and binding conventions
- prior provider hints
- source-format summaries like `csv`, `parquet`, and `avro`
- bounded schema summaries from earlier discoveries
- a small list of recent successful copilot outcomes

This gives the model continuity across runs without replaying full files or full interview transcripts.

## Step 3: See The Precedence Rules

Forge merges inputs in this order:

1. Explicit CLI flags and context-file values
2. Current-run interactive answers
3. Current discovery results from this run
4. Saved project memory
5. Built-in defaults

That means memory can influence ambiguous cases, but it does not override what you explicitly asked for, it does not outrank fresh discovery, and it does not beat newer answers from the current run.

Examples:

- If you pass `--provider snowflake`, that wins.
- If the current repo clearly contains BigQuery SQL and GCP Terraform, current discovery wins.
- If the current run is ambiguous, saved memory can gently steer copilot back toward the project’s established template and provider conventions.

## Step 4: See The Memory Status In The UX

When memory is loaded, Forge now shows a short status summary before generation, for example:

```text
Loaded project memory from runtime/.state/copilot-memory.json
Saved profile: template=analytics, provider=local, domain=analytics
Remembered build engines: sql
Saved schema summaries: 2; recent successful outcomes: 3
```

When memory is disabled:

```text
Project memory is disabled for this run (--no-memory).
```

When no memory exists yet:

```text
No project-scoped copilot memory was found yet.
Copilot will rely on your current answers and discovery only.
```

## Step 5: Know What Gets Sent To The LLM

Forge sends only a bounded `project_memory` summary. It does **not** send the raw memory file verbatim.

Typical prompt memory includes:

```json
{
  "preferred_template": "analytics",
  "preferred_provider": "local",
  "build_engines": ["sql"],
  "binding_formats": ["csv"],
  "provider_hints": ["local"],
  "source_formats": {
    "parquet": 1
  },
  "schema_summaries": [
    {
      "path": "samples/customers.parquet",
      "format": "parquet",
      "columns": {
        "customer_id": "integer",
        "created_at": "datetime"
      }
    }
  ]
}
```

The goal is to remind the model about stable project conventions, not to replay raw data.

## Step 6: See How Forge Explains Memory Influence

Forge now explains where seed template and provider guidance came from.

Example:

```text
Template seed: analytics from saved project memory.
Provider seed: gcp from current discovery.
Saved memory was treated as a soft preference and did not override stronger current signals.
```

That makes it easier to understand whether memory actually influenced the run or whether explicit input or fresh discovery took precedence.

## Step 7: Understand What Is Stored

After a successful run, Forge can store:

- accepted template
- accepted provider
- domain
- owner team
- build engines used in the successful contract
- expose kinds and binding formats
- provider hints from discovery
- source-format counts
- bounded schema summaries for discovered sources
- a small summary of recent successful outcomes

## Step 8: Understand What Is Not Stored

Forge does **not** persist:

- API keys
- bearer tokens
- auth headers
- LLM request bodies
- raw CSV or JSON rows
- Parquet or Avro records
- full README text
- full SQL text
- full contract bodies
- free-form interview transcripts
- absolute user-home paths

For example, an external file like `/Users/alice/data/customers.parquet` is reduced to a safe label such as `external/customers.parquet`.

## Step 9: Save Memory Explicitly

### Interactive Run

In interactive mode, Forge asks after a successful scaffold:

```text
Save project-scoped copilot memory to runtime/.state/copilot-memory.json?
```

Before that prompt, Forge now shows a short preview of what will be stored, such as template/provider, remembered build engines, source-format counts, and summary counts.

If you answer yes, Forge writes the file.

If you answer no, Forge leaves the project without memory.

### Non-Interactive Run

In non-interactive mode, Forge never saves implicitly. You must pass `--save-memory`.

Example:

```bash
export OPENAI_API_KEY=sk-...
fluid forge \
  --non-interactive \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --save-memory
```

If you omit `--save-memory`, Forge still generates and scaffolds the project, but it does not write memory.

## Step 10: How Memory Interacts With The Adaptive Interview

Memory is part of the interview context, not a hidden override.

In practice, that means:

- memory can help Forge skip unnecessary questions when the project already has stable conventions
- memory can steer template or provider seeding when the current run is ambiguous
- memory stays a soft preference when stronger evidence exists from explicit input or current discovery
- any assumptions inferred from memory are surfaced back to the user before generation

## Step 11: See A Two-Run Example

### First Run

Assume this repo contains:

```text
my-product/
├── samples/
│   └── customers.parquet
└── README.md
```

You run:

```bash
cd my-product
export OPENAI_API_KEY=sk-...
fluid forge \
  --llm-provider openai \
  --llm-model gpt-4o-mini
```

Forge:

1. discovers the Parquet schema metadata
2. generates a full contract
3. validates and repairs it if needed
4. scaffolds the project if validation passes
5. asks whether to save memory

If you confirm, Forge writes:

```text
my-product/runtime/.state/copilot-memory.json
```

### Second Run In The Same Repo

Later, from the same repo:

```bash
cd my-product
fluid forge --dry-run
```

Forge now uses:

- current discovery from the repo
- saved project memory from the first successful run

That means the model sees not only the current Parquet metadata, but also the project’s previously accepted template, provider, binding conventions, and recent successful outcome summaries.

Because this example uses `--dry-run`, Forge does not prompt to save memory again.

## Step 12: Inspect, Disable, Or Reset Memory

Show the current memory summary:

```bash
fluid forge --show-memory
```

Ignore memory for one run:

```bash
fluid forge --no-memory
```

Delete the saved memory file:

```bash
fluid forge --reset-memory
```

The next copilot run starts fresh unless you save memory again.

## Step 13: Handle Corrupt Memory Safely

If `runtime/.state/copilot-memory.json` is corrupt or invalid:

- Forge logs a warning
- Forge ignores the file for that run
- Forge continues with the current context and discovery
- a later successful save can overwrite the bad file

Corrupt memory should not block project creation.

## Recommended Commands

Interactive run with discovery and memory loading:

```bash
fluid forge \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --discover
```

Non-interactive run that saves memory:

```bash
fluid forge \
  --non-interactive \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --save-memory
```

Ignore memory for a one-off experiment:

```bash
fluid forge \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --no-memory
```

Inspect current memory:

```bash
fluid forge --show-memory
```

Reset current memory:

```bash
fluid forge --reset-memory
```

## How Memory And Discovery Work Together

Discovery and memory are complementary:

- discovery captures what is true right now in the local workspace
- memory captures what has worked successfully before in this project

Discovery is the fresher signal, so it wins when they conflict.

For the full discovery pipeline, see [Forge Copilot Discovery Guide](./forge-copilot-discovery.md).
