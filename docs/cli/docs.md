# `fluid docs`

Generate a static index of FLUID contracts found under a source tree.

## Syntax

```bash
fluid docs [--src DIR | --files GLOB] [--out DIR]
```

## Key options

| Option | Description |
| --- | --- |
| `--src` | Root directory to scan for contracts. Default `products`. |
| `--files` | Glob of contract files to catalog. Builds the rich multi-contract HTML catalog (see below). |
| `--out` | Docs output folder. Default `docs`. |

## Examples

```bash
fluid docs
fluid docs --src services --out site/docs
```

## Multi-contract HTML catalog

`--files` takes a glob and builds a browsable HTML catalog instead of the minimal `--src` index:

```bash
fluid docs --files 'products/**/contract.fluid.yaml' --out site/catalog
```

The output is a self-contained static site — inline CSS, vanilla JavaScript, no framework, no external assets:

- `index.html` — every contract in a searchable table, filtered client-side (no build step, no server).
- `contract-<slug>.html` — one drill-in page per contract: a metadata table, the full schema with type / nullable / PII columns, the `consumes[]` list, and a back-link to the index.
- `index.json` — the same catalog as machine-readable data.

## Notes

- Walks `<src>/**/contract.fluid.*` recursively and writes a single `index.json` listing each contract path under `<out>/`.
- In `--src` mode this is a minimal indexer, not a full static-site generator — the `index.json` is intended for an external docs site or a downstream renderer. Use `--files` for a ready-to-host HTML catalog.
- Output directories are created automatically.
- For a full data-product summary view, see [`fluid status`](./status.md).
