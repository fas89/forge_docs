# `fluid config`

Get or set workspace defaults such as provider, project, and region.

## Syntax

```bash
fluid config                  # interactive guide (no verb → friendly panel)
fluid config <list|set|get>
```

::: tip Bare invocation is friendly
Running `fluid config` with no verb
renders a Rich panel listing `list`, `get`, and `set` with example
invocations.  When `.fluid/context.json` already exists in the cwd the
guide highlights `list`; otherwise it points the operator at `set` as
the right starting move.
:::

## Commands

| Command | Description |
| --- | --- |
| `list` | Show current context |
| `set` | Set a key |
| `get` | Read a key |

## Examples

```bash
fluid config list
fluid config set provider gcp
fluid config set project my-gcp-project
fluid config set region us-central1
fluid config get provider
```
