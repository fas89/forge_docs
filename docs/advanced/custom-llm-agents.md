# Built-in And Custom LLM Agents

`fluid forge --mode copilot` is the primary AI-backed project creation path. It can discover local metadata, generate a full FLUID contract, validate and repair it, and scaffold the project only after the contract passes validation.

Built-in copilot providers:

- OpenAI
- Anthropic / Claude
- Gemini
- Ollama

Use a custom agent only when you need bespoke questioning, a non-standard provider, or domain-specific planning behavior that goes beyond the built-in copilot flow.

If you want a private ChatGPT GPT that drafts and reviews FLUID contracts rather than running through `fluid forge --mode copilot`, use the [FLUID Forge Contract GPT Packet](/advanced/chatgpt-forge-contract-gpt/).

## Built-in Copilot Configuration

### CLI Flags

```bash
fluid forge --mode copilot \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --discovery-path ./data
```

Supported copilot flags:

| Flag | Purpose |
|------|---------|
| `--llm-provider` | Selects the built-in adapter: `openai`, `anthropic`, `claude`, `gemini`, `ollama` |
| `--llm-model` | Selects the model for the chosen adapter |
| `--llm-endpoint` | Overrides the adapter's exact HTTP endpoint |
| `--discover` / `--no-discover` | Enables or disables local metadata discovery |
| `--discovery-path` | Adds a local file or directory to the discovery scan |
| `--memory` / `--no-memory` | Enables or disables loading repo-local copilot memory |
| `--save-memory` | Saves repo-local copilot memory after a successful non-interactive run |
| `--show-memory` | Shows the current project-scoped copilot memory summary and exits |
| `--reset-memory` | Deletes the current project-scoped copilot memory file and exits |

Resolution precedence:

- Provider, model, and endpoint: `CLI flags > FLUID_LLM_* > built-in defaults`
- API key: `FLUID_LLM_API_KEY > provider-specific env vars`

Provider-specific API key fallbacks:

- OpenAI: `OPENAI_API_KEY`
- Anthropic / Claude: `ANTHROPIC_API_KEY`
- Gemini: `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- Ollama: no key required by default

### Credentials

Secrets stay in the environment. Forge does not expose a `--llm-api-key` flag.

```bash
# OpenAI
export OPENAI_API_KEY=sk-...
fluid forge --mode copilot --llm-provider openai --llm-model gpt-4o-mini

# Anthropic / Claude
export ANTHROPIC_API_KEY=sk-ant-...
fluid forge --mode copilot --llm-provider anthropic --llm-model claude-3-5-sonnet-latest

# Gemini
export GEMINI_API_KEY=...
fluid forge --mode copilot --llm-provider gemini --llm-model gemini-1.5-pro

# Ollama
export OLLAMA_HOST=http://localhost:11434
fluid forge --mode copilot --llm-provider ollama --llm-model llama3.1
```

If you prefer a `.env` file, load it in your shell before running Forge:

```bash
export $(grep -v '^#' .env | xargs)
fluid forge --mode copilot --llm-provider openai
```

### What `--llm-endpoint` Means

`--llm-endpoint` is an exact HTTP endpoint override for the chosen adapter.

Use it when you need:

- Ollama or another local gateway
- A proxy in front of OpenAI, Anthropic, or Gemini
- An OpenAI-compatible self-hosted endpoint

Examples:

```bash
fluid forge --mode copilot \
  --llm-provider ollama \
  --llm-model llama3.1 \
  --llm-endpoint http://localhost:11434/v1/chat/completions
```

```bash
fluid forge --mode copilot \
  --llm-provider openai \
  --llm-model gpt-4o-mini \
  --llm-endpoint https://gateway.example.com/v1/chat/completions
```

### What `--discovery-path` Sends

`--discovery-path` points Forge at an extra local file or directory to scan. V1 discovery is local-only.

Forge may inspect:

- SQL files
- dbt projects
- Terraform files
- existing FLUID contracts
- README headings
- sample CSV, JSON, JSONL, Parquet, or Avro files

Forge sends only distilled metadata to the LLM, such as:

- column names and inferred types
- table names and SQL references
- Parquet column types and row counts when schema readers are available
- Avro field names and logical types when schema readers are available
- provider hints and build constraints

Forge does **not** send:

- raw sample rows
- full file contents
- secrets or credentials

[Full step-by-step discovery guide →](./forge-copilot-discovery.md)
[Full step-by-step memory guide →](./forge-copilot-memory.md)

### Installing Discovery Helpers For Parquet And Avro

Parquet and Avro discovery are metadata-only features. They use optional local readers so Forge can inspect schema without uploading the files.

Install the optional copilot discovery dependencies:

```bash
pip install "fluid-forge[copilot]"
```

Or install the readers directly:

```bash
pip install pyarrow fastavro
```

If those readers are not installed, Forge still discovers the file paths but cannot extract Parquet or Avro schema metadata.

## Project-Scoped Copilot Memory

Forge can also load project-scoped memory from:

```text
runtime/.state/copilot-memory.json
```

Memory is enabled by default when that file exists.

Use:

- `--no-memory` to ignore saved memory for one run
- `--save-memory` to persist memory after a successful non-interactive run
- `--show-memory` to inspect what Forge currently remembers for this project
- `--reset-memory` to clear the saved memory file

Interactive runs ask whether to save memory after a successful scaffold.

When memory is loaded, Forge now surfaces that in the copilot UX and explains whether template/provider seed guidance came from explicit input, current discovery, saved project memory, or defaults.

Saved memory contains bounded project conventions such as:

- accepted template and provider
- domain and owner team
- build and binding conventions
- source-format summaries
- bounded schema summaries
- recent successful outcome summaries

Saved memory does **not** contain:

- API keys or tokens
- raw sample rows
- full SQL, README, or contract bodies
- free-form prompt transcripts

For the full flow, see [Forge Copilot Memory Guide](./forge-copilot-memory.md).

## When To Build A Custom Agent

Use a custom domain agent when you need one or more of these:

- custom interview questions before generation
- a non-built-in provider or routing layer
- organization-specific architecture rules
- a domain expert that should steer template and provider selection

Custom domain agents are registered for `fluid forge --mode agent --agent <name>`.

## Creating A Custom Domain Agent

### 1. Implement the Agent Class

Create a new file at `fluid_build/cli/agents/my_agent.py` or add it to `fluid_build/cli/forge_agents.py`:

```python
import json
import os
from typing import Any, Dict, List

import httpx

from fluid_build.cli.forge_agents import AIAgentBase


class MyLLMAgent(AIAgentBase):
    def __init__(self):
        super().__init__(
            name="my-llm",
            description="LLM-powered domain agent",
            domain="general",
        )
        self.api_url = os.environ.get(
            "FLUID_LLM_ENDPOINT",
            "https://api.openai.com/v1/chat/completions",
        )
        self.api_key = os.environ.get("FLUID_LLM_API_KEY", "")
        self.model = os.environ.get("FLUID_LLM_MODEL", "gpt-4o-mini")

    def get_questions(self) -> List[Dict[str, Any]]:
        return [
            {
                "key": "project_goal",
                "question": "Describe the data product you want to build:",
                "type": "text",
                "required": True,
            },
            {
                "key": "data_sources",
                "question": "What data sources will you use?",
                "type": "text",
                "required": True,
            },
        ]

    def analyze_requirements(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = {
            "project_goal": context.get("project_goal"),
            "data_sources": context.get("data_sources"),
            "provider_hint": context.get("provider", "local"),
        }

        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "Recommend a FLUID template and provider. "
                        "Return strict JSON with keys recommended_template, "
                        "recommended_provider, recommended_patterns, "
                        "architecture_suggestions, best_practices."
                        f"\n\nContext:\n{json.dumps(prompt, indent=2)}"
                    ),
                }
            ],
        }

        with httpx.Client(timeout=60) as client:
            response = client.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            raw = response.json()["choices"][0]["message"]["content"]

        parsed = json.loads(raw)
        return {
            "recommended_template": parsed.get("recommended_template", "starter"),
            "recommended_provider": parsed.get("recommended_provider", "local"),
            "recommended_patterns": parsed.get("recommended_patterns", []),
            "architecture_suggestions": parsed.get("architecture_suggestions", []),
            "best_practices": parsed.get("best_practices", []),
        }
```

### 2. Register the Agent

```python
from fluid_build.cli.agents.my_agent import MyLLMAgent

DOMAIN_AGENTS = {
    "finance": FinanceAgent,
    "healthcare": HealthcareAgent,
    "retail": RetailAgent,
    "my-llm": MyLLMAgent,
}
```

```bash
fluid forge --mode agent --agent my-llm
```

### 3. Agent Response Contract

Your custom agent should return a dictionary like this from `analyze_requirements()`:

```python
{
    "recommended_template": "analytics",   # starter | analytics | etl_pipeline | ml_pipeline | streaming
    "recommended_provider": "gcp",         # local | gcp | aws | snowflake
    "recommended_patterns": ["layered_architecture"],
    "architecture_suggestions": ["Use incremental loads where possible"],
    "best_practices": ["Set up automated data-quality checks"],
}
```

## Advanced: Extension Hooks

If you need your LLM to participate in the generation lifecycle rather than just the planning phase, create a Forge **Extension**:

```python
from fluid_build.forge.core.interfaces import Extension, GenerationContext


class LLMReviewExtension(Extension):
    """Call an LLM at key forge lifecycle points."""

    def get_metadata(self):
        return {
            "name": "llm-review",
            "description": "LLM-powered review at each generation stage",
            "version": "1.0.0",
        }

    def on_template_selected(self, template, context: GenerationContext):
        """Review the chosen template with an LLM and log suggestions."""
        # Call your LLM here...
        pass

    def on_generation_complete(self, context: GenerationContext):
        """Post-generation review — validate contract quality."""
        # Call your LLM to review the generated contract...
        pass

    def modify_prompts(self, prompts, context: GenerationContext):
        """Inject additional prompts powered by LLM analysis."""
        prompts.append({
            "name": "llm_extra",
            "type": "confirm",
            "message": "Apply AI-recommended optimizations?",
            "default": True,
        })
        return prompts
```

Register the extension:

```python
from fluid_build.forge.core.registry import extension_registry

extension_registry.register("llm-review", LLMReviewExtension)
```

### Available Lifecycle Hooks

| Hook | When It Fires |
|------|--------------|
| `on_forge_start` | Forge process begins |
| `on_template_selected` | User picks a template |
| `on_provider_configured` | Provider config is finalized |
| `on_generation_complete` | All files have been generated |
| `modify_prompts` | Before interactive prompts are shown |

## Agent Policy for AI Access Control

FLUID contracts support an `agentPolicy` block that governs how AI models may access exposed data products. If your LLM agent produces data products consumed by other AI systems, define policies in the contract:

```yaml
exposes:
  - exposeId: sales_metrics
    kind: table
    policy:
      agentPolicy:
        allowedModels:
          - gpt-4
          - claude-sonnet-4-20250514
        deniedUseCases:
          - training
          - fine_tuning
        maxTokensPerRequest: 8192
        canStore: false
        auditRequired: true
        purposeLimitation: "Sales reporting only"
```

Validate with:

```bash
fluid policy-check contract.fluid.yaml
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `FLUID_LLM_PROVIDER` | Built-in copilot provider override | `openai` |
| `FLUID_LLM_ENDPOINT` | Exact endpoint override for the selected adapter | provider default |
| `FLUID_LLM_API_KEY` | API authentication key | — |
| `FLUID_LLM_MODEL` | Model identifier | provider default |
| `FLUID_FORGE_MODE` | Default creation mode | `copilot` |
| `FLUID_AGENT_DOMAIN` | Default domain agent | — |

## Troubleshooting

**Copilot says the API key is missing:**
Set `FLUID_LLM_API_KEY` or the provider-specific fallback for the adapter you selected.

**Copilot generated a contract but refused to scaffold the project:**
That means the contract did not pass validation after the repair loop. Re-run with clearer context or a stronger model.

**Unsure whether `--llm-endpoint` is required:**
Leave it unset unless you are routing to Ollama, a proxy, or a self-hosted OpenAI-compatible endpoint.

**Worried that discovery uploads sample data:**
It does not in v1. Forge shares metadata summaries only, not raw rows or full file bodies.

**Agent not appearing in `--agent` choices:**
Ensure your class is imported and added to `DOMAIN_AGENTS` before the CLI registers its argument parser.

**LLM call timing out:**
Increase the `httpx.Client(timeout=...)` value. Self-hosted models on CPU can be slow — 120s is a safe starting point.

**Bad JSON from LLM:**
The example `_parse_response()` falls back to safe defaults on parse failure. For better reliability, add a system prompt that instructs the model to return strictly valid JSON.

**`ModuleNotFoundError: httpx`:**
`httpx` is a core FLUID dependency — it should already be installed. If not: `pip install httpx`.
