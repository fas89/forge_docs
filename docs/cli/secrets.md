# `fluid secrets`

Manage secrets used by acquisition pipelines — Postgres passwords, Snowflake key-pair paths, Airbyte API tokens, etc. Lives under its own umbrella so it doesn't collide with `fluid auth` (cloud-provider auth) or `fluid ai setup` (LLM credentials).

::: tip Available in 0.8.3
`fluid secrets` ships with the source-aligned acquisition stack in `0.8.3` (schema `0.7.3`). Earlier releases don't include it.
:::

## Syntax

```bash
fluid secrets <subcommand> <secretRef> [options]
```

The `secretRef` is a dotted path that the contract refers to via `${SECRETREF}` placeholders — e.g. `postgres.prod.password`, `airbyte.token`, `snowflake.keypair_path`.

## Subcommands

### `fluid secrets login`

Store a secret. The value is read from stdin (when piped) or an interactive hidden prompt — never from a command-line flag, so it can't leak via `ps` or shell history.

```bash
fluid secrets login postgres.prod.password
# (prompts for value; input is hidden)

# Pipe the value from stdin (CI / scripted)
printf '%s' "$AIRBYTE_TOKEN" | fluid secrets login airbyte.token

cat /etc/keys/sf.p8 | fluid secrets login snowflake.keypair_path --expires-at 2027-01-01T00:00:00Z
```

| Option | Description |
|---|---|
| `<secretRef>` | Required. The reference name. |
| `--expires-at <iso8601>` | Optional. When the secret expires (informational; the rotator uses this hint). |
| `--json` | Emit a JSON result object instead of the human line. |

### `fluid secrets verify`

Probe the backend to confirm the secret exists and is reachable. Does not echo the value.

```bash
fluid secrets verify postgres.prod.password
fluid secrets verify postgres.prod.password --json
```

| Option | Description |
|---|---|
| `<secretRef>` | Required. The reference name. |
| `--json` | Emit a JSON result object instead of the human line. |

### `fluid secrets rotate`

Replace a stored secret with a new value. The new value is read from stdin or an interactive hidden prompt — never from a flag. The result object's `detail` field reports `rotated` when a prior secret existed, or `stored (no prior secret)` when there wasn't one.

```bash
fluid secrets rotate postgres.prod.password
# (prompts for new value)

# Pipe the new value from stdin
printf '%s' "$NEW_TOKEN" | fluid secrets rotate airbyte.token --expires-at 2027-04-01T00:00:00Z
```

| Option | Description |
|---|---|
| `<secretRef>` | Required. The reference name. |
| `--expires-at <iso8601>` | Optional new expiry. |
| `--json` | Emit a JSON result object instead of the human line. |

## `--json` output

All three subcommands share one result shape under `--json`:

```json
{
  "success": true,
  "ref": "postgres.prod.password",
  "backend": "keychain",
  "detail": "present",
  "expires_at": null
}
```

- `success` — `true` when the operation completed; the process exit code mirrors this.
- `backend` — `keychain` (default) or `memory` (when `FLUID_SECRETS_INMEMORY=1`).
- `detail` — short human note (`present` / `not found in backend` / `rotated` / `stored (no prior secret)` etc.).
- `expires_at` — echoes `--expires-at` when one was passed; otherwise `null`.

## Backends

| Backend | When it's used |
|---|---|
| **OS keychain** *(default)* | macOS Keychain / Linux Secret Service / Windows Credential Manager. Same backend `fluid ai setup` uses for LLM keys. |
| **In-memory** | Tests and CI. Enable with `FLUID_SECRETS_INMEMORY=1`. Lost when the process exits. |

You don't pick the backend on the command line; it's process-global per the env var.

## How contracts reference secrets

Acquisition contract fields read `${env.VAR}` placeholders that are resolved at apply time:

```yaml
properties:
  source:
    connection:
      host: "{{ env.PGHOST }}"
      password: "{{ env.PGPASSWORD }}"
```

`fluid secrets login pg.password` doesn't change that — it stores into the backend so the next `fluid apply` can resolve `${SECRET:pg.password}` references when the contract uses that pattern. The two reference styles coexist:

- `{{ env.X }}` — read environment variable `X` at apply time
- `${SECRET:pg.password}` — read from the secrets backend at apply time

Use `${SECRET:...}` for credentials that shouldn't sit in environment variables (CI logs, parent processes); use `{{ env.X }}` for fixtures or local dev.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Operation succeeded |
| `1` | Backend unavailable, secret not found, or user declined the prompt |

## See also

- [Source-Aligned Acquisition](/forge_docs/advanced/source-aligned-acquisition.html) — why pipelines need secrets
- [Credential Resolver](/forge_docs/advanced/credential-resolver.html) — how Forge resolves `${SECRET:...}` placeholders at runtime
- [Typed CLI Errors](/forge_docs/advanced/typed-cli-errors.html) — `SecretResolutionError`
