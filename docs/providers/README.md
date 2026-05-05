# Providers

Fluid Forge uses a **provider system** to deploy your data contracts to different platforms. The same YAML contract works everywhere — locally with DuckDB, on GCP with BigQuery, on AWS with S3+Athena, or on Snowflake.

::: tip How Providers Work
Each provider implements two methods: `plan()` (pure planning, no side effects) and `apply()` (execute against the target). See [Architecture](./architecture.md) for the full design.
:::

## Provider Status

| Provider | Plan / Apply | Airflow Gen | Dagster / Prefect | Status |
|----------|-------------|-------------|-------------------|--------|
| **[GCP](./gcp.md)** | ✅ | ✅ | ✅ | Production |
| **[AWS](./aws.md)** | ✅ | ✅ | ✅ | Production |
| **[Snowflake](./snowflake.md)** | ✅ | ✅ | ✅ | Production |
| **[Local](./local.md)** | ✅ | — | — | Production |
| **Azure** | 🔜 Q3 2026 | 🔜 | 🔜 | Planned |

### Data Catalog & Standards

| Export Target | Purpose | Status |
|--------------|---------|--------|
| **ODPS** | Linux Foundation Open Data Product Spec v4.1 | ✅ Production |
| **ODCS** | Open Data Contract Standard v3.1 (Bitol.io) | ✅ Production |
| **OPDS** | Open Data Product Specification | ✅ Production |
| **Datamesh Manager** | Publish to datamesh-manager.com | ✅ Production |

### Export Metadata Mapping

When you export to ODPS or publish to DataMesh Manager, Fluid Forge derives catalog metadata from your contract with a few explicit fallback rules.

| Output field | Source fields | Notes |
|--------------|---------------|-------|
| Output port provider / type | `binding.platform`, then legacy `provider` where supported | Exports prefer the FLUID 0.7.1 `binding.platform` field. |
| Expose kind | `expose.kind`, then `expose.type` | Use `kind` in new contracts; `type` is kept as a fallback. |
| ODPS product type | `metadata.product_type`, `metadata.type`, top-level `product_type`, top-level `type` | The first populated value is exported as the ODPS `type` custom property. |
| ODPS tags | `metadata.tags`, then top-level `tags` | ODPS uses one tag source, with metadata taking precedence. |
| DataMesh Manager tags | top-level `tags` merged with `metadata.tags` | Metadata tags are appended without duplicating existing top-level tags. |

If multiple candidate fields are present, keep `binding.platform`, `kind`, and `metadata.*` values aligned so exported catalogs stay predictable across providers.

---

## Quick Start by Provider

### GCP (BigQuery)

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

fluid apply contract.fluid.yaml --provider gcp --yes
```

[Full GCP Guide →](./gcp.md)

### AWS (S3 + Athena + Glue)

```bash
aws configure

fluid apply contract.fluid.yaml --provider aws --yes
```

[Full AWS Guide →](./aws.md)

### Snowflake

```bash
export SNOWFLAKE_ACCOUNT=your_account
export SNOWFLAKE_USER=your_user

fluid apply contract.fluid.yaml --provider snowflake --yes
```

`SNOWFLAKE_ACCOUNT` can be a locator, an org-account identifier, a privatelink account, or a full Snowflake / Snowsight hostname. Forge normalizes these forms before connecting.

[Full Snowflake Guide →](./snowflake.md)

### Local (DuckDB)

```bash
fluid init my-project --quickstart
fluid apply contract.fluid.yaml --yes
```

[Full Local Guide →](./local.md)

---

## Feature Matrix

| Feature | GCP | AWS | Snowflake | Local |
|---------|-----|-----|-----------|-------|
| Plan & apply | ✅ | ✅ | ✅ | ✅ |
| IAM / RBAC compilation | ✅ | ✅ | ✅ | — |
| Airflow DAG generation | ✅ | ✅ | ✅ | — |
| Dagster pipeline export | ✅ | ✅ | ✅ | — |
| Prefect flow export | ✅ | ✅ | ✅ | — |
| Sovereignty validation | ✅ | ✅ | ✅ | — |
| ODPS / ODCS export | ✅ | ✅ | ✅ | — |

### Key Services per Provider

| Capability | GCP | AWS | Snowflake |
|-----------|-----|-----|-----------|
| Data warehouse | BigQuery | Athena + Redshift | Native tables |
| Object storage | GCS | S3 | Stages |
| IAM | Cloud IAM | IAM policies | RBAC grants |
| Orchestration | Cloud Composer | MWAA | Snowflake Tasks |
| Streaming | Pub/Sub | Kinesis | Snowpipe |

---

## Choosing a Provider

| If you... | Choose |
|-----------|--------|
| Are developing or testing locally | **[Local](./local.md)** |
| Use Google Cloud / BigQuery | **[GCP](./gcp.md)** |
| Are on AWS with S3 + Athena/Glue | **[AWS](./aws.md)** |
| Run a Snowflake data warehouse | **[Snowflake](./snowflake.md)** |
| Need to export to open standards | Use ODPS / ODCS / OPDS exporters |

All providers use the **same contract format** and **same CLI commands**. Switching is a one-line config change.

---

## Building Custom Providers

Need support for a platform we don't cover yet? Build your own provider in ~40 lines of Python:

```python
from fluid_provider_sdk import ApplyResult, BaseProvider

class MyProvider(BaseProvider):
    name = "my-platform"

    def plan(self, contract):
        # Return list of actions
        return [{"op": "create_table", "name": contract["name"]}]

    def apply(self, actions):
        # Execute actions against your platform
        for action in actions:
            self._execute(action)
        return ApplyResult(provider=self.name, applied=len(actions), failed=0)
```

[Full Custom Provider Guide →](./custom-providers.md)

---

## Roadmap

| Milestone | Providers | Timeline |
|-----------|----------|----------|
| v0.7.9 (current) | GCP, AWS, Snowflake, Local, ODPS, ODCS | ✅ Released |
| v0.8.x | Azure (Synapse, Data Lake Gen2) | Q3 2026 |
| v0.9.x | Databricks (SQL, Delta Lake, Unity Catalog) | Q4 2026 |

[Detailed Roadmap →](./roadmap.md)

---

## Learn More

- [Provider Architecture](./architecture.md) — How discovery, planning, and the action system work
- [Custom Providers](./custom-providers.md) — Build your own provider with the SDK
- [CLI Reference](/cli/) — All available commands
- [Contributing](/contributing) — Help add new providers

---

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://github.com/Agentics-Rising">Agentics Transformation Pty Ltd</a> · Open source under Apache 2.0</p>
