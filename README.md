<p align="center">
  <img src="docs/.vuepress/public/fluid-forge-logo.png" alt="Fluid Forge" width="480">
</p>

<h1 align="center">Fluid Forge</h1>
<h3 align="center">Write YAML. Deploy Anywhere. Own Your Data Products.</h3>

<p align="center">
  <a href="https://pypi.org/project/fluid-forge/"><img src="https://img.shields.io/pypi/v/fluid-forge?color=blue&label=PyPI" alt="PyPI"></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/python-3.9%2B-blue" alt="Python 3.9+"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green" alt="License"></a>
  <a href="https://github.com/agentics-rising/forge_docs/actions/workflows/deploy-docs.yml"><img src="https://img.shields.io/github/actions/workflow/status/agentics-rising/forge_docs/deploy-docs.yml?label=docs" alt="Docs Build"></a>
</p>

<p align="center">
  <a href="https://agentics-rising.github.io/forge_docs/">📖 Live Docs</a> ·
  <a href="https://github.com/agentics-rising/fluid-forge-cli">⚡ CLI Repository</a> ·
  <a href="https://github.com/agentics-rising/forge_docs/issues">🐛 Report Issue</a> ·
  <a href="https://github.com/agentics-rising/fluid-forge-cli/discussions">💬 Discussions</a>
</p>

---

<h2 align="center">What Terraform did for infrastructure,<br>Fluid Forge does for data products.</h2>

<p align="center">
  One contract. Every cloud. Zero lock-in.<br>
  Define your data product in a single YAML file — schema, quality rules, lineage, governance, SLAs — then deploy it to <strong>GCP BigQuery</strong>, <strong>AWS Athena</strong>, <strong>Snowflake</strong>, or <strong>DuckDB</strong> with one command. No rewrites. No vendor lock-in. Ever.
</p>

---

## Why Fluid Forge?

Data teams are drowning in glue code. Every cloud has its own APIs, its own deploy patterns, its own way of doing quality checks. You end up maintaining **N copies of the same logic** across N platforms — and it still breaks on Friday at 5pm.

**Fluid Forge kills that complexity with 44 purpose-built CLI commands and a declarative contract system.**

| Problem | Fluid Forge Solution |
|---------|---------------------|
| Cloud-specific deploy scripts everywhere | **One declarative YAML contract** that runs on any provider |
| Schema drift breaks pipelines silently | **Built-in `validate` + `verify`** catches drift before and after deploy |
| No visibility into data quality | **`test` with quality gates, SLA checks & anomaly detection** — in the contract |
| Orchestration is hand-wired spaghetti | **`export` generates Airflow, Dagster, Prefect & Step Functions** from your contract |
| Governance is an afterthought | **`policy-check` → `policy-compile` → `policy-apply`** — governance-as-code, compiled to native IAM |
| Switching clouds means rewriting everything | **Swap one line** (`provider: gcp` → `provider: snowflake`) and redeploy |
| AI/LLM access to data is ungoverned | **`agentPolicy`** — declarative boundaries on which models can consume your data |

## 🚀 From Zero to Data Product in 30 Seconds

```bash
pip install fluid-forge
fluid init my-project --quickstart
fluid apply contract.fluid.yaml --yes
```

**That's it.** Your data product is live — running on DuckDB locally, no cloud account needed. When you're ready for production, change one line and push. Same contract, same guarantees, infinite scale.

```yaml
# contract.fluid.yaml — your entire data product in one file
fluidVersion: "0.7.1"
kind: DataProduct
id: "gold.crypto.bitcoin_tracker_v1"
name: "Bitcoin Price Tracker"

metadata:
  owner:
    team: data-engineering
    email: data-team@company.com
  domain: crypto
  tags: [real-time, pricing]

exposes:
  - exposeId: bitcoin_prices
    title: "Bitcoin Hourly Prices"
    kind: table
    contract:
      schema:
        - name: timestamp
          type: timestamp
          required: true
        - name: price_usd
          type: float64
          description: "Bitcoin price in USD"
    binding:
      platform: local        # swap to gcp, aws, or snowflake anytime
      format: duckdb_table
      location:
        database: crypto_data
        table: bitcoin_prices

dataQuality:
  rules:
    - type: not_null
      field: price_usd
    - type: freshness
      max_age: "1h"

governance:
  accessPolicy:
    - role: analyst
      access: read
    - role: data-engineer
      access: admin
```

## 🌍 Deploy Everywhere — From Laptop to Cloud

<table>
<tr>
<td align="center" width="25%"><strong>🏠 Local<br>(DuckDB)</strong><br><sub>Develop & test instantly<br>No cloud account needed</sub></td>
<td align="center" width="25%"><strong>☁️ GCP<br>(BigQuery + GCS)</strong><br><sub>Production analytics<br>Cloud Composer, Pub/Sub, IAM</sub></td>
<td align="center" width="25%"><strong>🔶 AWS<br>(S3 + Athena + Glue)</strong><br><sub>Serverless queries<br>on your data lake</sub></td>
<td align="center" width="25%"><strong>❄️ Snowflake</strong><br><sub>Enterprise warehouse<br>Snowpark & dbt integration</sub></td>
</tr>
</table>

**Plus:** Build your own providers with the [Provider SDK](https://github.com/agentics-rising/fluid-provider-sdk) — Databricks, Azure, Postgres, anything.

## ⚡ 44 Commands — Everything You Need

Fluid Forge isn't just `apply`. It's a complete data product lifecycle toolkit:

| Category | Commands | What It Does |
|----------|----------|-------------|
| **Declare & Deploy** | `init` · `validate` · `plan` · `apply` · `execute` | Build, validate, and deploy data products from YAML contracts |
| **Test & Verify** | `test` · `verify` · `contract-tests` · `diff` | Live resource validation, schema compatibility, drift detection |
| **Orchestration** | `export` · `generate-airflow` · `scaffold-composer` · `scaffold-ci` | Auto-generate Airflow DAGs, Dagster graphs, Prefect flows, CI/CD pipelines |
| **Governance** | `policy-check` · `policy-compile` · `policy-apply` | Validate policies, compile to native IAM, and enforce — all from the contract |
| **Visualization** | `viz-graph` · `viz-plan` · `preview` | Lineage diagrams (SVG/PNG/HTML), execution plan visualization |
| **Publishing** | `publish` · `export-opds` · `odcs` · `datamesh-manager` | Register in catalogs, export to OPDS/ODCS, push to Data Mesh Manager |
| **AI & Blueprints** | `forge` · `blueprint` · `marketplace` · `copilot` | AI-assisted creation, blueprint templates, marketplace discovery |
| **Config & Admin** | `context` · `providers` · `doctor` · `auth` · `wizard` | Provider management, diagnostics, interactive onboarding |

> Run `fluid doctor` to verify your setup, or `fluid wizard` for interactive onboarding.

## 🛡 Built-In Governance & Compliance

Governance isn't a plugin — it's a first-class citizen in every contract:

- **Column-level sensitivity** — Tag PII, classify data at the field level
- **Access policies** — RBAC rules that compile to native cloud IAM (BigQuery, Snowflake, AWS)
- **Data sovereignty** — Jurisdiction and residency enforcement baked into the contract
- **Agentic governance** — Control which AI/LLM models can access your data and for what purposes
- **Quality gates** — Anomaly detection, SLA thresholds, and freshness checks that block bad deploys

```bash
fluid policy-check contract.fluid.yaml     # Validate policies
fluid policy-compile contract.fluid.yaml   # Compile to native IAM JSON
fluid policy-apply contract.fluid.yaml     # Enforce on infrastructure
```

## 📚 Documentation

Everything you need to go from first install to production-grade data products:

| Section | Description |
|---------|-------------|
| **[Getting Started](https://agentics-rising.github.io/forge_docs/getting-started/)** | Install & build your first data product in under 2 minutes |
| **[Walkthroughs](https://agentics-rising.github.io/forge_docs/walkthrough/local.html)** | Step-by-step guides — Local, GCP, Airflow, Jenkins CI/CD |
| **[CLI Reference](https://agentics-rising.github.io/forge_docs/cli/)** | Full command reference for all 44 CLI commands |
| **[Providers](https://agentics-rising.github.io/forge_docs/providers/)** | Deep dives into GCP, AWS, Snowflake, Local & Custom providers |
| **[Advanced](https://agentics-rising.github.io/forge_docs/advanced/blueprints.html)** | Blueprints, governance, Airflow integration, AI-powered agents |
| **[Vision & Roadmap](https://agentics-rising.github.io/forge_docs/vision.html)** | Where we're headed and how to shape the future |

## 🛠 Running the Docs Locally

```bash
git clone https://github.com/agentics-rising/forge_docs.git
cd forge_docs
npm install
npm run docs:dev       # Dev server at http://localhost:8080
```

Build for production:

```bash
npm run docs:build     # Output → docs/.vuepress/dist/
npm run docs:preview   # Preview the production build
```

## 🏗 Site Structure

```
docs/
├── README.md                  # Home page (live site landing)
├── vision.md                  # Philosophy & roadmap
├── contributing.md            # How to contribute
├── RELEASE_NOTES_0.7.1.md    # Latest release notes
├── getting-started/           # Installation & first steps
├── walkthrough/               # Step-by-step guides (Local, GCP, Airflow, Jenkins)
├── cli/                       # CLI command reference
├── providers/                 # Provider docs (GCP, AWS, Snowflake, Local, Custom)
├── advanced/                  # Blueprints, governance, Airflow integration, AI agents
└── .vuepress/
    ├── config.ts              # VuePress configuration & navigation
    └── public/                # Static assets (logo, favicon)
```

## 🚢 Deployment

Pushes to `main` automatically build and deploy to **GitHub Pages** via the workflow in `.github/workflows/deploy-docs.yml`.

**Live docs:** **https://agentics-rising.github.io/forge_docs/**

> **Note:** To enable GitHub Pages, go to your repository **Settings → Pages** and set the source to **GitHub Actions**.

## 🤝 Contributing

We welcome contributions! Whether it's fixing a typo, improving an explanation, or adding a new guide:

1. Fork this repository
2. Create a branch (`git checkout -b docs/my-improvement`)
3. Make your changes — the dev server hot-reloads on save
4. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](docs/contributing.md) and our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🔗 Related Repositories

| Repository | Description |
|-----------|-------------|
| [`fluid-forge-cli`](https://github.com/agentics-rising/fluid-forge-cli) | The Fluid Forge CLI — the core engine |
| [`fluid-provider-sdk`](https://github.com/agentics-rising/fluid-provider-sdk) | SDK for building custom providers |

## License

Copyright 2025-2026 [Agentics Transformation Pty Ltd](https://fluidhq.io).

Licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) for the full license text and [NOTICE](NOTICE) for attribution details.

---

<p align="center">
  <strong>Built with <a href="https://v2.vuepress.vuejs.org/">VuePress 2</a></strong> · <strong>Powered by <a href="https://github.com/agentics-rising/fluid-forge-cli">Fluid Forge</a></strong>
  <br>
  <sub>Declarative Data Products for Modern Data Teams</sub>
  <br><br>
  <strong>Proudly developed by <a href="https://dustlabs.co.za">dustlabs.co.za</a></strong>
</p>
