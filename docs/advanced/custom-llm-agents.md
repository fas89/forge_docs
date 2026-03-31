# Custom LLM Agents

Plug your own Large Language Model into Fluid Forge to power AI-assisted data product creation. Any OpenAI-compatible API, Anthropic Claude, AWS Bedrock, or self-hosted model (Ollama, vLLM) works out of the box.

## How Forge Agents Work

When you run `fluid forge`, the CLI enters one of four creation **modes**:

| Mode | Flag | Description |
|------|------|-------------|
| **Copilot** | `--mode copilot` | General-purpose assistant (default) |
| **Agent** | `--mode agent --agent <name>` | Domain expert (finance, healthcare, retail, or custom) |
| **Template** | `--mode template` | Traditional template-based scaffolding |
| **Blueprint** | `--mode blueprint` | Enterprise blueprint patterns |

In **copilot** and **agent** mode the CLI collects user context through interactive questions, passes it to an agent's `analyze_requirements()` method, and feeds the result into the `ForgeEngine` which generates the project.

```
┌────────────┐     context      ┌─────────────────┐    suggestions    ┌─────────────┐
│  CLI User  │ ──────────────▶  │  Your LLM Agent │ ──────────────▶  │ ForgeEngine │
│  (prompts) │                  │  analyze_reqs()  │                  │  generates   │
└────────────┘                  └─────────────────┘                  └─────────────┘
```

By subclassing `AIAgentBase` you can inject any LLM — OpenAI, Anthropic, a self-hosted model, or your own fine-tuned endpoint — into this pipeline.

## Creating a Custom Agent

### 1. Implement the Agent Class

Create a new file at `fluid_build/cli/agents/my_agent.py` (or add directly to `fluid_build/cli/forge_agents.py`):

```python
import os
from pathlib import Path
from typing import Dict, Any, List

import httpx

from fluid_build.cli.forge_agents import AIAgentBase


class MyLLMAgent(AIAgentBase):
    """Custom agent backed by your own LLM endpoint."""

    def __init__(self):
        super().__init__(
            name="my-llm",
            description="LLM-powered agent for data-product creation",
            domain="general",
        )
        # Read config from environment — never hard-code secrets
        self.api_url = os.environ.get(
            "FLUID_LLM_ENDPOINT", "https://api.openai.com/v1/chat/completions"
        )
        self.api_key = os.environ.get("FLUID_LLM_API_KEY", "")
        self.model = os.environ.get("FLUID_LLM_MODEL", "gpt-4")

    # ── Interactive questions ──────────────────────────────────
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
            {
                "key": "provider",
                "question": "Target provider?",
                "type": "choice",
                "choices": ["local", "gcp", "aws", "snowflake"],
                "default": "local",
            },
        ]

    # ── LLM-powered analysis ──────────────────────────────────
    def analyze_requirements(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_prompt(context)
        llm_response = self._call_llm(prompt)
        return self._parse_response(llm_response, context)

    def _build_prompt(self, context: Dict[str, Any]) -> str:
        return (
            "You are a data-engineering architect. Given the following requirements, "
            "recommend a FLUID Forge template, provider, architecture patterns, and "
            "best practices. Respond in JSON with keys: recommended_template, "
            "recommended_provider, recommended_patterns, architecture_suggestions, "
            "best_practices.\n\n"
            f"Project goal: {context.get('project_goal')}\n"
            f"Data sources: {context.get('data_sources')}\n"
            f"Provider preference: {context.get('provider', 'local')}\n"
        )

    def _call_llm(self, prompt: str) -> str:
        """Call your LLM endpoint synchronously."""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4,
        }

        with httpx.Client(timeout=60) as client:
            resp = client.post(self.api_url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    def _parse_response(
        self, raw: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Parse the LLM JSON into the format ForgeEngine expects."""
        import json

        # Safely default to sensible values if the LLM returns bad JSON
        defaults = {
            "recommended_template": "starter",
            "recommended_provider": context.get("provider", "local"),
            "recommended_patterns": [],
            "architecture_suggestions": [],
            "best_practices": [],
        }
        try:
            parsed = json.loads(raw)
            defaults.update(
                {k: v for k, v in parsed.items() if k in defaults}
            )
        except (json.JSONDecodeError, KeyError):
            pass
        return defaults
```

### 2. Register the Agent

Add your agent class to the `DOMAIN_AGENTS` registry at the bottom of `fluid_build/cli/forge_agents.py`:

```python
from fluid_build.cli.agents.my_agent import MyLLMAgent

DOMAIN_AGENTS = {
    "finance": FinanceAgent,
    "healthcare": HealthcareAgent,
    "retail": RetailAgent,
    "my-llm": MyLLMAgent,          # ← your agent
}
```

Once registered, the CLI discovers it automatically:

```bash
# Use your agent
fluid forge --mode agent --agent my-llm

# List all available agents
fluid forge --mode agent --help
```

### 3. Configure Credentials

Set environment variables — avoid hard-coding secrets:

```bash
# .env (never commit this file)
FLUID_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
FLUID_LLM_API_KEY=sk-...
FLUID_LLM_MODEL=gpt-4
```

Load them before running the CLI:

```bash
export $(grep -v '^#' .env | xargs)
fluid forge --mode agent --agent my-llm
```

## Connecting to Different LLM Providers

The `_call_llm()` method is the only integration point. Swap it out for any provider:

### OpenAI / Azure OpenAI

```python
def _call_llm(self, prompt: str) -> str:
    with httpx.Client(timeout=60) as client:
        resp = client.post(
            "https://api.openai.com/v1/chat/completions",
            json={
                "model": "gpt-4",
                "messages": [{"role": "user", "content": prompt}],
            },
            headers={"Authorization": f"Bearer {self.api_key}"},
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
```

### Anthropic Claude

```python
def _call_llm(self, prompt: str) -> str:
    with httpx.Client(timeout=60) as client:
        resp = client.post(
            "https://api.anthropic.com/v1/messages",
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": prompt}],
            },
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
            },
        )
        resp.raise_for_status()
        return resp.json()["content"][0]["text"]
```

### Self-Hosted / Ollama

```python
def _call_llm(self, prompt: str) -> str:
    # Any OpenAI-compatible endpoint works — llama.cpp, vLLM, Ollama, etc.
    with httpx.Client(timeout=120) as client:
        resp = client.post(
            "http://localhost:11434/v1/chat/completions",
            json={
                "model": "llama3",
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
```

### AWS Bedrock

```python
def _call_llm(self, prompt: str) -> str:
    import boto3, json

    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    resp = client.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": prompt}],
        }),
    )
    body = json.loads(resp["body"].read())
    return body["content"][0]["text"]
```

## Agent API Contract

Your agent must return a dictionary from `analyze_requirements()` that the `ForgeEngine` understands:

```python
{
    # Required — maps to a registered ForgeEngine template
    "recommended_template": "analytics",    # analytics | starter | mlpipelinetemplate | etlpipelinetemplate | streamingtemplate

    # Required — maps to a registered provider
    "recommended_provider": "gcp",          # local | gcp | aws | snowflake

    # Optional — architecture patterns to apply
    "recommended_patterns": [
        "layered_architecture",
        "data_mesh"
    ],

    # Optional — shown to user as recommendations
    "architecture_suggestions": [
        "Use partitioned tables for time-series data",
        "Implement CDC for incremental loads"
    ],

    # Optional — shown to user
    "best_practices": [
        "Set up automated data-quality checks",
        "Document SLAs in contract metadata"
    ],
}
```

The `create_project()` method (inherited from `AIAgentBase`) takes care of:

1. Calling `analyze_requirements()` with user context
2. Displaying the analysis in a Rich panel
3. Building a `ForgeEngine`-compatible config
4. Delegating to `ForgeEngine.run_with_config()` for validated project generation
5. Showing next-steps guidance

You only need to implement `get_questions()` and `analyze_requirements()`.

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
| `FLUID_LLM_ENDPOINT` | API base URL for your LLM | — |
| `FLUID_LLM_API_KEY` | API authentication key | — |
| `FLUID_LLM_MODEL` | Model identifier | `gpt-4` |
| `FLUID_FORGE_MODE` | Default creation mode | `copilot` |
| `FLUID_AGENT_DOMAIN` | Default domain agent | — |

## Troubleshooting

**Agent not appearing in `--agent` choices:**
Ensure your class is imported and added to `DOMAIN_AGENTS` before the CLI registers its argument parser.

**LLM call timing out:**
Increase the `httpx.Client(timeout=...)` value. Self-hosted models on CPU can be slow — 120s is a safe starting point.

**Bad JSON from LLM:**
The example `_parse_response()` falls back to safe defaults on parse failure. For better reliability, add a system prompt that instructs the model to return strictly valid JSON.

**`ModuleNotFoundError: httpx`:**
`httpx` is a core FLUID dependency — it should already be installed. If not: `pip install httpx`.
