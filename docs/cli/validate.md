# validate Command

Validate Fluid Forge contracts for correctness, provider compatibility, and best practices.

## Syntax

```bash
fluid validate <contract-file> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--verbose` | Show detailed validation output | `false` |
| `--strict` | Fail on warnings (not just errors) | `false` |
| `--provider <name>` | Validate for specific provider | Auto-detect |
| `--output <file>` | Save validation report to file | Console only |

## What It Validates

### 1. Schema Validation

✅ **YAML/JSON Structure**
- Valid YAML/JSON syntax
- Required top-level fields
- Proper nesting and indentation

✅ **Version Compatibility**
- `fluidVersion` field present
- Version format valid
- Features supported in specified version

### 2. Provider Compatibility

✅ **Provider Configuration**
- Provider name valid (gcp, aws, snowflake, local)
- Provider-specific required fields
- Region/location specifications
- Credential references

✅ **Resource Types**
- Resources supported by provider
- Naming conventions followed
- Quota and limits respected

### 3. Data Contracts

✅ **Schema Definitions**
- Column names valid
- Data types supported
- Constraints properly formatted
- Primary/foreign keys defined

✅ **SQL Queries**
- Syntax validity
- Referenced tables exist
- Column references valid
- JOIN conditions correct

### 4. IAM & Security

✅ **Access Policies**
- IAM policy structure valid
- Roles and permissions valid
- Principal formats correct
- Conditions syntax valid

✅ **Encryption Settings**
- KMS key references valid
- Encryption types supported
- Security configurations proper

### 5. Dependencies

✅ **Resource Dependencies**
- Circular dependencies detected
- Dependency graph valid
- All dependencies resolvable
- Execution order determinable

## Examples

### Basic Validation

```bash
fluid validate contract.yaml
```

**Output:**
```
✅ Schema validation passed
✅ Provider 'gcp' configuration valid
✅ 3 tables, 2 views validated
✅ SQL queries parseable
✅ IAM policies well-formed

Contract is ready for deployment!
```

### Verbose Mode

```bash
fluid validate contract.yaml --verbose
```

**Detailed Output:**
```
[INFO] Loading contract: contract.yaml
[INFO] Contract ID: customer-analytics
[INFO] Fluid version: 0.7.1
[INFO] Provider: gcp

Schema Validation:
  ✅ YAML syntax valid
  ✅ Required fields present: fluidVersion, kind, id, name, metadata
  ✅ Metadata complete: provider, environment, owner

Provider Validation (GCP):
  ✅ Project ID format valid: my-project-123
  ✅ Region valid: us-central1
  ✅ Dataset naming conventions followed
  ✅ BigQuery quotas respected

Data Contract Validation:
  ✅ Table 'customers': 12 columns, schema valid
  ✅ Table 'orders': 8 columns, foreign key to customers valid
  ✅ View 'customer_summary': SQL syntax valid
  
Dependency Analysis:
  ✅ No circular dependencies detected
  ✅ Execution order: [raw_data] → [customers, orders] → [customer_summary]
  
IAM Validation:
  ✅ 3 IAM policies validated
  ✅ All roles exist: roles/bigquery.dataViewer, roles/bigquery.jobUser
  ✅ Principal formats valid

Security Checks:
  ✅ Encryption enabled for all datasets
  ✅ KMS key references valid
  
Performance Warnings:
  ⚠️  Table 'large_events' has no partitioning (consider adding)
  ⚠️  Query in 'expensive_aggregation' scans full table

Summary:
  Status: VALID ✅
  Errors: 0
  Warnings: 2
  Tables: 3
  Views: 2
  Queries: 5
  
Contract is ready for deployment with 2 optimization suggestions.
```

### Strict Mode

```bash
fluid validate contract.yaml --strict
```

**Fails on warnings:**
```
❌ Validation failed in strict mode

Errors: 0
Warnings: 2

Warnings treated as errors:
  ⚠️  Line 45: Table 'large_events' missing partition configuration
  ⚠️  Line 89: Query scans full table, consider adding WHERE clause

Run without --strict to deploy despite warnings.
```

### Provider-Specific Validation

```bash
fluid validate contract.yaml --provider snowflake
```

**Snowflake-specific checks:**
```
Snowflake Provider Validation:
  ✅ Warehouse name valid: COMPUTE_WH
  ✅ Database naming conventions followed
  ✅ Schema references valid
  ✅ Warehouse size appropriate: X-SMALL
  ✅ Clustering keys optimal
  
Performance Recommendations:
  💡 Table 'events': Consider micro-partitions for date column
  💡 Query 'aggregations': Use materialized view for better performance
```

### Save Report to File

```bash
fluid validate contract.yaml --verbose --output validation-report.json
```

**validation-report.json:**
```json
{
  "status": "valid",
  "timestamp": "2026-01-30T10:30:00Z",
  "contract": {
    "id": "customer-analytics",
    "version": "0.7.1",
    "provider": "gcp"
  },
  "validation_results": {
    "schema": {"status": "passed", "errors": 0},
    "provider": {"status": "passed", "errors": 0},
    "data_contract": {"status": "passed", "errors": 0, "warnings": 2},
    "iam": {"status": "passed", "errors": 0},
    "dependencies": {"status": "passed", "errors": 0}
  },
  "warnings": [
    {
      "line": 45,
      "severity": "warning",
      "message": "Table 'large_events' has no partitioning",
      "suggestion": "Add partition_by field for better performance"
    }
  ],
  "performance_score": 8.5,
  "security_score": 10.0
}
```

## Validation Rules

### Naming Conventions

| Provider | Dataset/Database | Table | Column |
|----------|-----------------|-------|--------|
| **GCP** | `[a-z][a-z0-9_]*` (max 1024) | `[a-z][a-z0-9_]*` (max 1024) | Any valid UTF-8 |
| **AWS** | `[a-z][a-z0-9_]*` (max 255) | `[a-z][a-z0-9_]*` (max 255) | `[a-zA-Z0-9_]*` |
| **Snowflake** | `[A-Za-z][A-Za-z0-9_]*` | `[A-Za-z][A-Za-z0-9_]*` | `[A-Za-z][A-Za-z0-9_]*` |

### Data Type Compatibility

**Supported Across All Providers:**
- STRING, INTEGER, FLOAT, BOOLEAN
- DATE, TIMESTAMP, DATETIME
- BYTES, JSON

**Provider-Specific:**
- **GCP**: GEOGRAPHY, ARRAY, STRUCT, NUMERIC
- **AWS**: SUPER (JSON), GEOMETRY
- **Snowflake**: VARIANT, OBJECT, ARRAY

### SQL Validation

✅ **Supported SQL Features:**
- SELECT, FROM, WHERE, JOIN
- GROUP BY, ORDER BY, HAVING
- Subqueries and CTEs
- Window functions
- UNION, INTERSECT, EXCEPT

❌ **Not Validated (passed through):**
- User-defined functions
- Stored procedures
- Provider-specific extensions

## Common Validation Errors

### Error: Missing Required Fields

```
❌ Validation failed

Line 1: Missing required field 'fluidVersion'
Line 5: Missing required field 'metadata.provider'
```

**Fix:**
```yaml
fluidVersion: "0.7.2"
kind: Contract
id: my-contract
name: "My Contract"
metadata:
  provider: gcp  # Add provider
```

### Error: Invalid Provider Configuration

```
❌ GCP validation failed

Line 12: Invalid project ID format 'My_Project'
  Project IDs must be lowercase and use hyphens
  
Line 15: Region 'usa-east' not valid
  Valid regions: us-central1, us-east1, europe-west1, ...
```

**Fix:**
```yaml
metadata:
  provider: gcp
  project: my-project-123  # Use hyphens, lowercase
  region: us-east1  # Use valid region name
```

### Error: Circular Dependency

```
❌ Dependency validation failed

Circular dependency detected:
  table_a depends on view_b
  view_b depends on table_c
  table_c depends on table_a

This creates an infinite loop. Remove one dependency.
```

**Fix:**
Break the circular dependency by restructuring your data model.

### Error: Invalid SQL

```
❌ SQL validation failed

Line 45: Query references undefined table 'customer_data'
Line 52: Column 'total_amount' not found in table 'orders'
Line 60: Syntax error near 'WERE' (did you mean WHERE?)
```

**Fix:**
```sql
-- Correct table and column names
SELECT 
  customer_id,
  SUM(amount) as total_amount  -- Use correct column name
FROM orders  -- Use correct table name
WHERE order_date >= '2026-01-01'  -- Fix typo
GROUP BY customer_id
```

## Integration with CI/CD

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Validating Fluid contracts..."
for contract in contracts/*.yaml; do
  fluid validate "$contract" --strict
  if [ $? -ne 0 ]; then
    echo "❌ Validation failed: $contract"
    exit 1
  fi
done
echo "✅ All contracts valid"
```

### GitHub Actions

```yaml
name: Validate Contracts
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Fluid Forge
        run: pip install data-product-forge
      
      - name: Validate All Contracts
        run: |
          for contract in contracts/*.yaml; do
            fluid validate "$contract" --strict --verbose
          done
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any
  stages {
    stage('Validate Contracts') {
      steps {
        sh '''
          fluid validate contract.yaml \
            --verbose \
            --output validation-report.json
        '''
        publishHTML([
          reportDir: '.',
          reportFiles: 'validation-report.json',
          reportName: 'Contract Validation'
        ])
      }
    }
  }
}
```

## Best Practices

### 1. Always Validate Before Deploy

```bash
# Good practice
fluid validate contract.yaml && fluid apply contract.yaml

# Avoid
fluid apply contract.yaml  # Might deploy invalid config
```

### 2. Use Verbose Mode in CI/CD

```bash
# In automated pipelines, use verbose for debugging
fluid validate contract.yaml --verbose --output report.json
```

### 3. Run Provider-Specific Validation

```bash
# When deploying to specific provider
fluid validate contract.yaml --provider gcp --strict
```

### 4. Check Performance Warnings

```bash
# Review warnings for optimization opportunities
fluid validate contract.yaml --verbose | grep "⚠️"
```

## Performance

| Contract Size | Validation Time | Memory Usage |
|---------------|----------------|--------------|
| Small (< 100 lines) | < 50ms | < 10 MB |
| Medium (100-500 lines) | 50-200ms | 10-50 MB |
| Large (500-2000 lines) | 200-800ms | 50-200 MB |
| Enterprise (> 2000 lines) | < 2s | < 500 MB |

## See Also

- [plan command](./plan.md) - Preview deployment changes
- [apply command](./apply.md) - Deploy validated contracts
- [generate schedule command](./generate-schedule.md) - Generate Airflow DAGs
