# plan Command

Generate an execution plan showing what infrastructure changes will be made, without actually deploying.

## Syntax

```bash
fluid plan <contract-file> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--provider <name>` | Target provider (required) | Auto-detect from contract |
| `--project <id>` | Cloud project/account ID | From contract metadata |
| `--region <name>` | Cloud region | From contract metadata |
| `--env <environment>` | Environment name (dev/staging/prod) | `dev` |
| `--output <file>` | Save plan to file | Console output |
| `--json` | Output plan in JSON format | `false` |

## What It Shows

The plan command analyzes your contract and shows:

- 🔍 **Resources to create** - New tables, datasets, warehouses
- 🔄 **Resources to modify** - Schema changes, configuration updates
- 🗑️ **Resources to delete** - Removed or replaced resources
- ⚠️ **Breaking changes** - Operations that may cause data loss
- 📊 **Cost estimates** - Projected monthly costs

## Examples

### Basic Plan

```bash
fluid plan contract.yaml --provider gcp
```

**Output:**
```
Execution Plan for 'customer-analytics'
Provider: GCP (project: my-project-123, region: us-central1)

Resources to CREATE:
  + dataset.analytics
  + table.analytics.customers (5 columns, 10 GB estimated)
  + table.analytics.orders (8 columns, 50 GB estimated)
  + view.analytics.customer_summary

Resources to MODIFY:
  ~ table.analytics.products
      - Add column: category (STRING)
      - Add column: price (FLOAT64)

Resources to DELETE:
  - view.analytics.old_customer_view (deprecated)

Estimated Monthly Cost: $75-$150

⚠️  Warning: Deleting view 'old_customer_view' may break downstream queries

To apply these changes, run:
  fluid apply contract.yaml --provider gcp
```

### Detailed JSON Output

```bash
fluid plan contract.yaml --provider gcp --json --output plan.json
```

**plan.json:**
```json
{
  "contract_id": "customer-analytics",
  "provider": "gcp",
  "project": "my-project-123",
  "region": "us-central1",
  "timestamp": "2026-01-30T10:30:00Z",
  "resources": {
    "create": [
      {
        "type": "dataset",
        "name": "analytics",
        "properties": {
          "location": "us-central1",
          "description": "Customer analytics data"
        },
        "estimated_cost": 0
      },
      {
        "type": "table",
        "name": "analytics.customers",
        "properties": {
          "schema": [
            {"name": "customer_id", "type": "STRING"},
            {"name": "email", "type": "STRING"},
            {"name": "created_at", "type": "TIMESTAMP"}
          ],
          "partitioning": {"field": "created_at", "type": "DAY"}
        },
        "estimated_size_gb": 10,
        "estimated_monthly_cost": 20
      }
    ],
    "modify": [
      {
        "type": "table",
        "name": "analytics.products",
        "changes": [
          {
            "action": "add_column",
            "column": {"name": "category", "type": "STRING"}
          },
          {
            "action": "add_column",
            "column": {"name": "price", "type": "FLOAT64"}
          }
        ],
        "breaking": false
      }
    ],
    "delete": [
      {
        "type": "view",
        "name": "analytics.old_customer_view",
        "breaking": true,
        "warnings": ["May break downstream queries"]
      }
    ]
  },
  "summary": {
    "total_creates": 4,
    "total_modifies": 1,
    "total_deletes": 1,
    "breaking_changes": 1,
    "estimated_monthly_cost": {
      "min": 75,
      "max": 150,
      "currency": "USD"
    }
  }
}
```

### Snowflake Plan

```bash
fluid plan snowflake-dwh.yaml --provider snowflake --env production
```

**Output:**
```
Execution Plan for 'enterprise-dwh'
Provider: Snowflake (account: xy12345.us-east-1)
Environment: production

Resources to CREATE:
  + database.EDW
  + schema.EDW.DIM
  + schema.EDW.FACT
  + schema.EDW.STAGING
  + warehouse.ENTERPRISE_WH (X-LARGE, auto-suspend: 300s)
  + table.EDW.DIM.CUSTOMERS (8 columns, clustered by CUSTOMER_KEY)
  + table.EDW.FACT.ORDERS (5 columns, clustered by ORDER_DATE)
  + materialized_view.EDW.MARTS.CUSTOMER_METRICS

Warehouse Configuration:
  Size: X-LARGE
  Credits/Hour: 16
  Auto-Suspend: 300 seconds
  Auto-Resume: true
  Multi-Cluster: 1-4 clusters

Estimated Monthly Cost:
  Compute: $256/month (assuming 8 hours/day)
  Storage: $50/month (200 GB)
  Total: $306/month

No breaking changes detected ✅

To apply these changes, run:
  fluid apply snowflake-dwh.yaml --provider snowflake --env production
```

### AWS Plan with Breaking Changes

```bash
fluid plan aws-etl.yaml --provider aws
```

**Output:**
```
Execution Plan for 'aws-data-pipeline'
Provider: AWS (account: 123456789012, region: us-east-1)

Resources to CREATE:
  + s3_bucket.raw-data-bucket
  + redshift_cluster.analytics-cluster (dc2.large, 2 nodes)
  + redshift_database.analytics
  + redshift_schema.public

Resources to MODIFY:
  ~ redshift_table.public.customers
      - Change column type: customer_id (VARCHAR(20) → VARCHAR(50))
      ⚠️  BREAKING: Data may be truncated or lost
      
  ~ redshift_table.public.orders
      - Drop column: legacy_order_id
      ⚠️  BREAKING: Column will be permanently deleted

Resources to DELETE:
  - lambda_function.old-data-processor
  - s3_bucket.deprecated-archive
      ⚠️  BREAKING: All objects in bucket will be deleted

⚠️  WARNING: 3 breaking changes detected!

Breaking Changes Summary:
  1. Column type change in 'customers' table may cause data loss
  2. Dropping column 'legacy_order_id' from 'orders' table
  3. Deleting S3 bucket 'deprecated-archive' and all contents

Estimated Monthly Cost:
  Redshift: $360/month (dc2.large, 2 nodes, 24/7)
  S3: $23/month (1 TB)
  Lambda: $5/month
  Total: $388/month

To proceed despite breaking changes:
  fluid apply aws-etl.yaml --provider aws --force
```

## Plan Details

### Resource Actions

| Symbol | Action | Description |
|--------|--------|-------------|
| **+** | CREATE | New resource will be created |
| **~** | MODIFY | Existing resource will be updated |
| **-** | DELETE | Resource will be removed |
| **⚠️** | WARNING | Breaking change or important notice |

### Breaking Changes

Operations that may cause data loss or service interruption:

- 🔴 **Dropping columns** - Data in column will be lost
- 🔴 **Changing data types** - May truncate or lose data
- 🔴 **Deleting tables/buckets** - All data will be deleted
- 🔴 **Removing partitioning** - Table must be recreated
- 🟡 **Schema changes** - May break dependent queries/views

### Cost Estimates

Cost projections include:

- **Storage costs** - Based on estimated data size
- **Compute costs** - Based on warehouse/cluster configuration
- **Network costs** - Data transfer estimates
- **Additional services** - Monitoring, logging, etc.

::: tip
Cost estimates are approximate and based on on-demand pricing. Actual costs may vary based on usage patterns, discounts, and reserved capacity.
:::

## Common Use Cases

### 1. Pre-Deployment Validation

```bash
# Check what will change before deploying
fluid plan contract.yaml --provider gcp
```

### 2. CI/CD Integration

```bash
# Generate plan in CI pipeline
fluid plan contract.yaml --provider gcp --json --output plan.json

# Review plan before deployment
cat plan.json | jq '.summary'
```

### 3. Compare Environments

```bash
# Plan for dev
fluid plan contract.yaml --env dev --output dev-plan.json

# Plan for prod
fluid plan contract.yaml --env prod --output prod-plan.json

# Compare
diff dev-plan.json prod-plan.json
```

### 4. Cost Analysis

```bash
# Review costs for different configurations
fluid plan small-cluster.yaml --provider snowflake
fluid plan large-cluster.yaml --provider snowflake
```

## Integration Examples

### GitHub Actions

```yaml
name: Plan Infrastructure Changes
on: pull_request

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Fluid Forge
        run: pip install data-product-forge
      
      - name: Generate Plan
        run: |
          fluid plan contract.yaml \
            --provider gcp \
            --json \
            --output plan.json
      
      - name: Comment PR with Plan
        uses: actions/github-script@v6
        with:
          script: |
            const plan = require('./plan.json');
            const comment = `## Infrastructure Plan
            
            **Creates:** ${plan.summary.total_creates}
            **Modifies:** ${plan.summary.total_modifies}
            **Deletes:** ${plan.summary.total_deletes}
            **Breaking Changes:** ${plan.summary.breaking_changes}
            
            **Estimated Cost:** $${plan.summary.estimated_monthly_cost.min}-$${plan.summary.estimated_monthly_cost.max}/month
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any
  stages {
    stage('Plan') {
      steps {
        sh 'fluid plan contract.yaml --provider gcp --json --output plan.json'
        
        script {
          def plan = readJSON file: 'plan.json'
          if (plan.summary.breaking_changes > 0) {
            input message: "${plan.summary.breaking_changes} breaking changes detected. Continue?",
                  ok: 'Deploy anyway'
          }
        }
      }
    }
    
    stage('Deploy') {
      steps {
        sh 'fluid apply contract.yaml --provider gcp'
      }
    }
  }
}
```

### Terraform-style Workflow

```bash
# 1. Validate contract
fluid validate contract.yaml

# 2. Generate plan
fluid plan contract.yaml --provider gcp --output plan.json

# 3. Review plan
cat plan.json | jq '.summary'

# 4. Apply plan
fluid apply contract.yaml --provider gcp

# 5. Verify deployment
fluid verify contract.yaml
```

## Troubleshooting

### Issue: Plan shows unexpected changes

**Cause:** Contract doesn't match current infrastructure state

**Solution:**
```bash
# Check current state
fluid verify contract.yaml --provider gcp

# Review differences
fluid diff contract.yaml --provider gcp
```

### Issue: Cost estimates missing

**Cause:** Insufficient metadata in contract

**Solution:**
Add size estimates to contract:
```yaml
exposes:
  - id: large_table
    location:
      type: bigquery
      properties:
        dataset: analytics
        table: events
    metadata:
      estimated_size_gb: 1000
      estimated_rows: 10000000
```

### Issue: Breaking changes not detected

**Cause:** Schema validation may not catch all breaking changes

**Solution:**
Always review plans carefully and test in non-production environments first.

## Best Practices

### 1. Always Plan Before Deploy

```bash
# Good: Review changes first
fluid plan contract.yaml --provider gcp
fluid apply contract.yaml --provider gcp

# Risky: Deploy without reviewing
fluid apply contract.yaml --provider gcp
```

### 2. Save Plans for Audit Trail

```bash
# Save plans with timestamps
fluid plan contract.yaml \
  --provider gcp \
  --output "plans/plan-$(date +%Y%m%d-%H%M%S).json"
```

### 3. Review Breaking Changes Carefully

```bash
# Filter for breaking changes
fluid plan contract.yaml --json | jq '.resources.modify[] | select(.breaking == true)'
```

### 4. Use Plans in PR Reviews

Include plan output in pull requests so reviewers can see infrastructure impact.

## See Also

- [validate command](./validate.md) - Validate contracts before planning
- [apply command](./apply.md) - Execute planned changes
- [verify command](./verify.md) - Verify deployment matches contract
