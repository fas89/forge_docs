# `fluid odps-bitol`

Export FLUID contracts to and validate Bitol.io's ODPS (Open Data Product Standard) v1.0 format, used for marketplace integrations such as Entropy Data.

::: tip Bidirectional at the provider layer
On `v0.8.3` the underlying `BitolOdpsProvider` round-trips Bitol ODPS (`render` + `import_contract` + `validate`). The `fluid odps-bitol` subcommand exposes `export` / `validate` / `info` here; the import side is exposed by the new unified [`fluid opds`](#unified-fluid-opds-since-v0-8-3) command — `fluid opds import <path> --spec bitol-1.0.0` accepts a single ODPS doc, a directory bundle, or a lone ODCS file. The provider's Python `import_contract` is also callable directly from the [SDK](/forge_docs/sdk-and-plugins/reference/).
:::

## Syntax

```bash
fluid odps-bitol export CONTRACT [--output PATH] [--format FMT] [--no-custom]
fluid odps-bitol validate ODPS_FILE
fluid odps-bitol info
```

## Key options

### `odps-bitol export`

| Option | Description |
| --- | --- |
| `CONTRACT` | Path to FLUID contract file. |
| `--output`, `-o` | Output file path. Default `<contract-name>-odps.<format>`. |
| `--format`, `-f` | Output format: `yaml` or `json`. Default `yaml`. |
| `--no-custom` | Exclude custom properties from the output. |

### `odps-bitol validate`

| Option | Description |
| --- | --- |
| `ODPS_FILE` | Path to an ODPS-Bitol data product file. |

### `odps-bitol info`

No options. Prints provider information (version, spec URL, capabilities).

## Examples

```bash
fluid odps-bitol export contract.fluid.yaml
fluid odps-bitol export contract.fluid.yaml -o product.json -f json
fluid odps-bitol validate product.yaml
fluid odps-bitol info
```

## Unified `fluid opds` (since v0.8.3)

`v0.8.3` introduced a single `fluid opds` command that dispatches between Bitol 1.0.0 and ODPI 4.1 via `--spec`, and adds an `import` subcommand the spec-specific `fluid odps-bitol` does not expose:

```bash
fluid opds export <contract> [--spec bitol-1.0.0|odpi-4.1] [--out PATH] [--out-dir DIR]
fluid opds import <path>     [--spec bitol-1.0.0] [--allow-remote] [-o PATH]
fluid opds validate <file>   [--spec ...]
fluid opds info              [--spec ...]
```

`fluid opds import` accepts three entry shapes — single ODPS doc, directory bundle (ODPS + sibling ODCS files), or a lone ODCS file. Remote `contractId` references are off by default; opt in with `--allow-remote` (SSRF-guarded — see [network safety](/forge_docs/advanced/network-safety.html)).

## Notes

- Despite the source file being named `odps_standard.py`, the canonical command name registered in `fluid --help` is `odps-bitol`. This avoids confusion with the official ODPS variant.
- For the official ODPS v4.1 (Open Data Product Initiative), use [`fluid odps`](./odps.md) instead.
- For the Open Data Contract Standard (ODCS), use [`fluid odcs`](./odcs.md).
- Validation checks `apiVersion` (`v1.0.0` expected), requires `kind: DataProduct`, and verifies output ports have a `name` field.
