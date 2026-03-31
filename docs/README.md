---
home: true
heroImage: /logo.png
heroText: Fluid Forge
tagline: Declarative Data Products — Write YAML, Deploy Anywhere.
actions:
  - text: Get Started in 2 Minutes →
    link: /getting-started/
    type: primary
  - text: View on GitHub
    link: https://github.com/agentics-rising/fluid-forge-cli
    type: secondary

features:
  - title: 🎯 One Contract. Every Cloud.
    details: Write a single YAML contract and deploy to GCP, AWS, Snowflake, or your laptop. Fluid Forge handles the cloud plumbing — datasets, tables, IAM, monitoring — so you don't have to.
  
  - title: 🚀 Zero to Production in Minutes
    details: "pip install → init → apply → done. No cloud account needed to start. Pre-built blueprints, AI-powered scaffolding, and a local DuckDB provider for instant feedback."
  
  - title: 🔄 Pipelines That Write Themselves
    details: Auto-generate production-ready Airflow DAGs, Dagster graphs, and Prefect flows straight from your contracts. No hand-written orchestration code.
  
  - title: 🛡️ Governance from Day One
    details: Policy-as-code, sovereignty controls, column-level security, data masking, and full audit trails baked in — not bolted on.
  
  - title: ☁️ True Multi-Cloud
    details: Same CLI. Same Jenkinsfile. Same contract. Deploy to GCP (BigQuery), AWS (Athena, Glue), and Snowflake without rewriting a single line.
  
  - title: 🧩 Extend Everything
    details: Build a custom cloud provider in ~40 lines of Python. Plug in any LLM for AI generation. Export to open standards (ODPS, ODCS) for full interoperability.

footer: Apache 2.0 Licensed | Developed with ❤️ by DustLabs. Copyright 2025-2026 [Agentics Transformation Pty Ltd]
---

<div class="badges" style="text-align: center; margin-bottom: 2rem;">

[![PyPI version](https://img.shields.io/pypi/v/fluid-forge?color=blue)](https://pypi.org/project/fluid-forge/)
[![Python 3.9+](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green)](https://github.com/agentics-rising/fluid-forge-cli/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-828%20passing-brightgreen)]()

</div>

## Why Fluid Forge?

Every cloud wants you locked in. Every SDK wants you to rewrite everything when you switch providers. **Fluid Forge says no.**

Write one declarative YAML contract. Deploy it to any cloud. Move between providers in seconds. This is **Infrastructure-as-Code for data engineering** — and it actually works.

<div class="comparison">

::: code-group

```python [❌ The Hard Way — 100+ lines per cloud]
from google.cloud import bigquery, storage

client = bigquery.Client(project='my-project')
dataset = bigquery.Dataset(client.dataset('analytics'))
dataset.location = 'US'
dataset.description = 'Customer analytics data'
client.create_dataset(dataset, exists_ok=True)

table_ref = dataset.table('customers')
schema = [
    bigquery.SchemaField('id', 'INTEGER', mode='REQUIRED'),
    bigquery.SchemaField('name', 'STRING', mode='REQUIRED'),
    bigquery.SchemaField('email', 'STRING', mode='REQUIRED'),
]
table = bigquery.Table(table_ref, schema=schema)
client.create_table(table, exists_ok=True)
# ... 80 more lines of IAM, monitoring, error handling
# ... then rewrite everything for AWS and Snowflake
```

```yaml [✅ Fluid Forge — One contract for every cloud]
# contract.fluid.yaml
fluidVersion: "0.7.1"
kind: DataProduct
id: analytics.customers
name: Customer Analytics

metadata:
  owner: { team: data-engineering }

exposes:
  - exposeId: customers_table
    kind: table
    binding:
      platform: gcp           # or aws, snowflake, local
      resource:
        type: bigquery_table
        dataset: analytics
        table: customers
    contract:
      schema:
        - name: id
          type: INTEGER
          required: true
        - name: name
          type: STRING
          required: true
        - name: email
          type: STRING
          required: true
          sensitivity: pii
```

:::

</div>

Then deploy with one command:

```bash
fluid apply contract.fluid.yaml --yes
```

That same contract deploys to GCP, AWS, Snowflake, or runs locally on DuckDB — **zero code changes**.

## Quick Start

```bash
# Install
pip install fluid-forge

# Create a project with sample data
fluid init my-project --quickstart
cd my-project

# Validate and run — no cloud account needed
fluid validate contract.fluid.yaml
fluid apply contract.fluid.yaml --yes
```

That's it. A working data product on your laptop in under 2 minutes — no cloud account, no credit card, no config hell. When you're ready for production, change `platform: local` to `platform: gcp` and run the exact same command.

::: tip Ready to dive deeper?
[Full Getting Started Guide →](/getting-started/)
:::

## Platform Support

| Platform | Deploy | IAM / RBAC | Airflow Gen | Key Services |
|----------|--------|-----------|-------------|-------------|
| **[GCP](/providers/gcp)** | ✅ Production | ✅ | ✅ | BigQuery, GCS, IAM |
| **[AWS](/providers/aws)** | ✅ Production | ✅ | ✅ | S3, Glue, Athena, IAM |
| **[Snowflake](/providers/snowflake)** | ✅ Production | ✅ | ✅ | Databases, Schemas, RBAC |
| **[Local](/providers/local)** | ✅ Production | — | — | DuckDB, CSV, Parquet |
| **Azure** | 🔜 Planned | 🔜 | 🔜 | Synapse, Data Lake |

All cloud providers use the **same CLI commands** and the **same CI/CD pipeline** — see [Universal Pipeline](/walkthrough/universal-pipeline).

## What's In the Box

| Feature | Description |
|---------|-------------|
| **40+ CLI commands** | `validate`, `plan`, `apply`, `verify`, `generate-airflow`, `export`, `policy-check`, and more |
| **Blueprints** | Pre-built templates: `customer-360`, `enterprise-snowflake`, analytics starters |
| **AI Copilot** | `fluid forge --mode copilot` — describe what you want in English, get a working project |
| **Governance Engine** | Access policies, sovereignty controls, data classification, compliance checks |
| **Orchestration Export** | Generate Airflow DAGs, Dagster pipelines, and Prefect flows from contracts |
| **Open Standards** | Export to ODPS v4.1, ODCS v3.1, and data mesh catalogs |
| **Custom Providers** | Build your own provider with ~40 lines of Python using the [Provider SDK](/providers/custom-providers) |
| **Universal CI/CD** | One Jenkinsfile that works for every provider — [zero branching logic](/walkthrough/universal-pipeline) |

## Who Uses Fluid Forge?

| Role | How Fluid Forge Helps |
|------|----------------------|
| **Data Engineers** | Build production pipelines without wrestling with cloud SDKs |
| **Analytics Teams** | Create self-service data products with governance built-in |
| **Platform Teams** | Standardize data infrastructure across the entire org |
| **Data Scientists** | Deploy ML feature pipelines with proper contracts and testing |

## Next Steps

<div class="next-steps">

**New here?** Start with the [Getting Started Guide](/getting-started/) — 2 minutes, no cloud account needed.

**Want a hands-on example?** [Local Walkthrough](/walkthrough/local) — build a Netflix analytics pipeline from scratch.

**Going to production?** Pick your cloud: [GCP](/providers/gcp) · [AWS](/providers/aws) · [Snowflake](/providers/snowflake)

**Setting up CI/CD?** [Universal Pipeline](/walkthrough/universal-pipeline) — one config file for every provider.

**Want to contribute?** [Contributing Guide](/contributing) · [GitHub](https://github.com/agentics-rising/fluid-forge-cli)

</div>

---

<div class="about-section" style="text-align: center; padding: 2rem 0 1rem; opacity: 0.85;">

**Developed with pride by [DustLabs](https://dustlabs.co.za/)** ·
Copyright 2025-2026 [Agentics Transformation Pty Ltd](https://fluidhq.io) · Open source under [Apache 2.0](https://github.com/agentics-rising/fluid-forge-cli/blob/main/LICENSE)

</div>

<style>
.badges img {
  display: inline-block;
  margin: 0 4px;
}

.next-steps {
  background: var(--c-bg-light);
  border-left: 4px solid var(--c-brand);
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;
}

.next-steps p {
  margin: 0.75rem 0;
  font-size: 1.05rem;
}
</style>
