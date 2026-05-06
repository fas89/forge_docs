---
title: Providers vs Platforms
description: The difference between a binding.platform value and the provider plugin that handles it.
---

# Providers vs Platforms

Two related but distinct ideas:

- **Platform** — a value in your contract (`binding.platform: gcp`) describing *where* the data lands.
- **Provider** — a Python plugin that knows *how* to make it land there. Each provider implements `plan()`, `apply()`, `verify()`, and policy-compilation hooks against a specific cloud.

`fluid providers` lists everything installed in your environment.

## Cloud providers shipping in `data-product-forge` 0.8.0

These are the cloud-platform providers that implement the full lifecycle (`plan` / `apply` / `verify` / policy compilation) against a target cloud:

| Provider | Status | Install extra |
|----------|--------|---------------|
| `local`     | ✅ Production (DuckDB, runs anywhere) | `pip install "data-product-forge[local]"` |
| `gcp`       | ✅ Production (BigQuery + GCS + IAM)  | `pip install "data-product-forge[gcp]"` |
| `aws`       | ✅ Production (S3 + Glue + Athena)    | `pip install "data-product-forge[aws]"` |
| `snowflake` | ✅ Production (Snowflake + Snowpark)  | `pip install "data-product-forge[snowflake]"` |
| `azure`     | 🔜 Roadmap (Synapse + ADLS)           | — |
| `databricks`| 🔜 Roadmap (Unity Catalog)            | — |

## Other valid `binding.platform` values

The schema enum also includes engines and runtime targets that aren't cloud providers in the same sense — they describe *how* the data lands, not *which cloud* it lands on:

| Value | Kind | Notes |
|-------|------|-------|
| `kafka`      | Streaming engine | Use with `format: kafka_topic`. Topic creation handled by your existing Kafka cluster, not by Fluid Forge — it just emits the binding contract. |
| `kubernetes` | Runtime target  | For long-running services / consumers, not for table-backed products. |
| `other`      | Escape hatch    | Lets you bind a contract to a custom provider you've registered via the [Provider SDK](/providers/custom-providers). |

## The provider plugin contract

Building a custom provider for an unsupported platform is supported — see [Custom Providers](/providers/custom-providers). The plugin must implement four methods:

```python
class MyProvider(BaseProvider):
    name = "my-cloud"

    def plan(self, contract): ...
    def apply(self, actions): ...
    def verify(self, contract): ...
    def policy_compile(self, contract): ...
```

Register via Python entry points in your `pyproject.toml`:

```toml
[project.entry-points."fluid_build.providers"]
my-cloud = "my_provider:MyProvider"
```

After `pip install my-fluid-provider`, `fluid providers` will list it automatically and contracts can use `platform: my-cloud`.

---

::: warning This page is a stub
Full provider authoring guide lives at [/providers/custom-providers](/providers/custom-providers). The conceptual long-form (provider lifecycle, action semantics, error translation patterns, version compatibility) is tracked in [docs-content #concepts-providers](https://github.com/Agentics-Rising/forge_docs/issues?q=is%3Aopen+label%3Adocs-content).
:::
