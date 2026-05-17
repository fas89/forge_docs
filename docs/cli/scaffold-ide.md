# `fluid scaffold-ide`

Generate agentic-IDE configuration so any AI-assisted editor can drive Fluid Forge — steering rules, hooks, and a ready-to-use MCP server entry, all written from one canonical pack.

## Syntax

```bash
fluid scaffold-ide [--target {kiro,cursor,claude-code,cline,generic}] [--out DIR] [--python PATH] [--force]
```

## Key options

| Option | Description |
| --- | --- |
| `--target` | Which agentic IDE to scaffold for — `kiro`, `cursor`, `claude-code`, `cline`, or `generic`. Default `kiro`. |
| `--out` | Workspace root to scaffold into. Default the current directory. |
| `--python` | Path to the Python interpreter `fluid` is installed under. Baked into the generated MCP config so the IDE can launch `fluid mcp serve` without relying on `PATH`. Default `sys.executable`. |
| `--force` | Overwrite existing files. Off by default, so re-runs stay safe. |

## Examples

```bash
fluid scaffold-ide --target claude-code
fluid scaffold-ide --target cursor --out ../my-workspace
fluid scaffold-ide --target generic --force
```

## What it generates

Every target receives the same canonical configuration pack, translated into that editor's native layout:

| `--target` | Writes |
| --- | --- |
| `kiro` | `.kiro/` |
| `cursor` | `.cursor/rules/` |
| `claude-code` | `.claude/` |
| `cline` | `.clinerules/` |
| `generic` | `AGENTS.md` + `mcp.json` |

The pack covers three things: **steering / rules** so the editor's agent understands FLUID contracts and the forge workflow, **hooks** that run the right `fluid` commands at the right time, and an **MCP server entry** pointing at [`fluid mcp serve`](./mcp.md) for the typed forge tools. Choose `generic` for any MCP-capable editor that is not one of the named four.

## Notes

- This is the editor half of the agentic-IDE workflow; the CLI half is [`fluid forge --agent`](./forge.md#headless-agent-mode), which drives Forge headlessly with JSON-Lines progress output.
- The generated MCP server can route LLM calls back through the editor (see [LLM sampling](../advanced/mcp.md#llm-sampling)), so an agentic IDE can run a full AI-assisted forge on its own subscription — no second API key.

## See also

- [`fluid forge`](./forge.md) — AI-assisted scaffolding, including headless `--agent` mode
- [`fluid mcp`](./mcp.md) — the MCP server the generated IDE config points at
- [`fluid scaffold-ci`](./scaffold-ci.md) — the equivalent generator for CI pipelines
- [Advanced MCP server guide](../advanced/mcp.md)
