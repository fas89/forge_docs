---
title: Vision & Roadmap
description: The philosophy behind Fluid Forge and where we're headed.
---

# Vision & Roadmap

## The Problem

Data engineering is too hard. Building a production analytics pipeline today means:

- **Hundreds of lines of cloud SDK boilerplate** per provider
- **Deep expertise** in BigQuery *and* Athena *and* Snowflake APIs
- **Manually crafting IAM policies**, then rewriting them for each cloud
- **Copy-paste infrastructure** with no reusable abstractions
- **Weeks of setup** before a single row of data flows

For every new data product, teams repeat the same laborious process. The industry has solved this for infrastructure (Terraform), containers (Kubernetes), and configuration (Ansible). **Data products deserve the same treatment.**

---

## The Solution

Fluid Forge introduces **Data Products as Code** — a declarative approach where you write a YAML contract describing *what* you want, and the engine figures out *how* to build it.

```yaml
# One contract. Every cloud.
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
      platform: gcp            # Change to aws or snowflake — same contract
      resource:
        type: bigquery_table
        dataset: analytics
        table: customers
        partitioning:
          type: time
          field: created_at
          granularity: DAY
    contract:
      schema:
        - name: id
          type: INTEGER
          required: true
        - name: email
          type: STRING
          sensitivity: pii
```

Behind the scenes, Fluid Forge:
- Creates datasets, tables, and schemas with optimal configuration
- Sets up IAM roles, service accounts, and RBAC
- Generates Airflow DAGs for orchestration
- Validates schema compatibility and detects configuration drift
- Enforces governance policies and data sovereignty rules

All from **one contract file**.

---

## Core Principles

### 1. Declarative First

You declare the desired state. Fluid Forge plans the execution, handles errors, ensures idempotency, and converges toward that state. No imperative scripts. No manual steps.

### 2. Developer Experience

```bash
pip install fluid-forge          # Install
fluid init my-project --quickstart  # Scaffold
fluid apply contract.fluid.yaml --yes  # Deploy
```

If a workflow isn't delightful, it's not done. Zero boilerplate, maximum productivity.

### 3. Multi-Cloud Native

GCP, AWS, and Snowflake are production-ready today. Azure and Databricks are on the roadmap. The key insight: **same contract, same commands, different cloud.** Switching providers is a one-line change.

### 4. Production Ready

Enterprise features out of the box:
- Built-in governance and compliance (GDPR, SOC2)
- Automated testing and contract validation
- Drift detection and remediation
- Comprehensive audit trails
- Multi-environment support (dev → staging → prod)

### 5. Open and Extensible

- **Open source** (Apache 2.0) and community-driven
- **Custom providers** — build one in ~40 lines of Python
- **LLM integration** — plug in any AI model for copilot-powered generation
- **Open standards** — export to ODPS v4.1, ODCS v3.1, data mesh catalogs

---

## The Data Product Lifecycle

Fluid Forge covers the full journey:

### Design

```bash
fluid wizard                              # Interactive guided setup
fluid forge --mode copilot                # AI-powered generation
fluid blueprint list --category analytics # Browse templates
```

### Validate

```bash
fluid validate contract.yaml              # Schema + semantic checks
fluid contract-tests contract.yaml        # Contract test suites
fluid policy-check contract.yaml          # Governance compliance
```

### Plan

```bash
fluid plan contract.yaml                  # Preview changes (no side effects)
fluid viz-graph contract.yaml             # Visualize data lineage
fluid diff contract.yaml --env prod       # Compare environments
```

### Deploy

```bash
fluid apply contract.yaml --yes           # Execute against target provider
fluid verify contract.yaml                # Post-deployment verification
fluid generate-airflow contract.yaml      # Generate orchestration
```

### Operate

```bash
fluid diff contract.yaml --exit-on-drift  # Monitor drift in CI/CD
fluid policy-apply policy.yaml            # Enforce governance changes
fluid export-opds contract.yaml           # Export to open data standards
```

---

## How It Compares

| DevOps Concept | Fluid Forge Equivalent |
|----------------|------------------------|
| Infrastructure as Code (Terraform) | **Data Products as Code** |
| GitOps | **DataOps — contracts in version control** |
| CI/CD Pipelines | **Automated data deployments** |
| Policy as Code (OPA/Sentinel) | **Governance as Code** |
| Observability | **Drift detection + contract verification** |

---

## Roadmap

| Milestone | What's Included | Timeline |
|-----------|----------------|----------|
| **v0.7.1** (current) | GCP + AWS + Snowflake production, Airflow/Dagster/Prefect export, governance engine | ✅ Released |
| **Azure Provider** | Synapse Analytics, Data Lake Gen2, Azure Functions | Q3 2026 |
| **Databricks Provider** | Databricks SQL, Delta Lake, MLflow, Unity Catalog | Q4 2026 |
| **Data Marketplace v2** | Publish, discover, and compose data products across teams | 2027 |

---

## Get Involved

Fluid Forge is open source and built in the open.

- **Star & Fork** — [github.com/agentics-rising/fluid-forge-cli](https://github.com/agentics-rising/fluid-forge-cli)
- **Report Issues** — [Issue Tracker](https://github.com/agentics-rising/fluid-forge-cli/issues)
- **Contribute** — [Contributing Guide](/contributing)
- **Discussions** — [GitHub Discussions](https://github.com/agentics-rising/fluid-forge-cli/discussions)

## Ready to Build?

**[Get Started →](/getting-started/)**

---

<p style="text-align: center; opacity: 0.7; font-size: 0.9rem;">Copyright 2025-2026 <a href="https://fluidhq.io">Agentics Transformation Pty Ltd</a> · Open source under Apache 2.0</p>
