# generate-airflow Command

Generate Airflow DAG Python code from a Fluid Forge contract.

::: tip Available Now
This command is fully available in FLUID v0.7.1 for AWS, GCP, and Snowflake providers.
:::

## Syntax

```bash
fluid generate-airflow <contract-file> [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output file path for generated DAG | `dags/<contract-name>.py` |
| `--env <environment>` | Environment name (dev/staging/prod) | `dev` |
| `--verbose` | Show detailed generation logs | `false` |

## What It Generates

The command creates a production-ready Airflow DAG with:

- ✅ **Task orchestration** - Proper task dependencies and sequencing
- ✅ **Error handling** - Retry logic and failure callbacks
- ✅ **Resource management** - Connection pooling and cleanup
- ✅ **Monitoring** - Task duration tracking and logging
- ✅ **Idempotency** - Safe to re-run without side effects
- ✅ **Type hints** - Full Python typing for IDE support

## Supported Providers

| Provider | Status | Example |
|----------|--------|---------|
| **AWS** | ✅ Available | BigQuery, S3, Redshift tasks |
| **GCP** | ✅ Available | BigQuery, GCS, Dataflow tasks |
| **Snowflake** | ✅ Available | Warehouse, table operations |

## Examples

### Basic Generation

Generate DAG for a GCP contract:

```bash
fluid generate-airflow gcp-analytics.yaml -o dags/gcp_pipeline.py
```

**Output:**
```
✅ Validated contract: gcp-analytics.yaml
✅ Generated Airflow DAG: dags/gcp_pipeline.py
⏱️  Generation time: 1.8ms
📊 Tasks created: 5 (3 BigQuery + 2 GCS)
```

### With Environment Specification

Generate for production environment:

```bash
fluid generate-airflow contract.yaml \
  --output dags/prod_pipeline.py \
  --env prod \
  --verbose
```

**Verbose Output:**
```
[INFO] Loading contract: contract.yaml
[INFO] Validating schema and dependencies
[INFO] Detected provider: gcp
[INFO] Generating Airflow DAG for environment: prod
[INFO] Creating task graph with 8 tasks
[INFO] Adding error handling and retries
[INFO] Writing DAG to: dags/prod_pipeline.py
✅ Complete in 2.1ms
```

### AWS Example

Generate DAG for AWS data pipeline:

```bash
fluid generate-airflow aws-etl.yaml -o dags/aws_etl.py
```

**Generated DAG includes:**
- S3 file operations
- Redshift data loading
- Lambda function triggers
- SNS notifications

### Snowflake Example

Generate DAG for Snowflake data warehouse:

```bash
fluid generate-airflow snowflake-dwh.yaml -o dags/snowflake_pipeline.py
```

**Generated DAG includes:**
- Warehouse management
- Table creation/updates
- SQL transformations
- Query monitoring

## Generated DAG Structure

### Imports and Configuration

```python
from airflow import DAG
from airflow.providers.google.cloud.operators.bigquery import BigQueryExecuteQueryOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'fluid-forge',
    'depends_on_past': False,
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}
```

### DAG Definition

```python
with DAG(
    dag_id='gcp_customer_analytics',
    default_args=default_args,
    description='Customer analytics pipeline for GCP',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=['gcp', 'analytics', 'customer'],
) as dag:
```

### Tasks with Dependencies

```python
    # Task 1: Load raw data
    load_raw = GCSToBigQueryOperator(
        task_id='load_raw_customer_data',
        bucket='analytics-bucket',
        source_objects=['raw/customers/*.parquet'],
        destination_project_dataset_table='analytics.raw_customers',
        write_disposition='WRITE_TRUNCATE',
    )
    
    # Task 2: Transform data
    transform = BigQueryExecuteQueryOperator(
        task_id='transform_customer_metrics',
        sql='sql/transform_customers.sql',
        use_legacy_sql=False,
        destination_dataset_table='analytics.customer_metrics',
        write_disposition='WRITE_TRUNCATE',
    )
    
    # Task 3: Export to GCS
    export = BigQueryToGCSOperator(
        task_id='export_customer_reports',
        source_project_dataset_table='analytics.customer_metrics',
        destination_cloud_storage_uris=['gs://reports/customers-{{ ds }}.csv'],
        export_format='CSV',
    )
    
    # Set dependencies
    load_raw >> transform >> export
```

## Performance Benchmarks

| Provider | Avg Generation Time | Lines of Code | Tasks (Typical) |
|----------|-------------------|---------------|-----------------|
| **GCP** | 1.83ms | 280-350 | 4-8 |
| **AWS** | 2.08ms | 320-400 | 5-10 |
| **Snowflake** | 1.91ms | 250-300 | 3-6 |

::: tip Production Ready
All generated DAGs include production best practices:
- Proper error handling and retries
- Task timeout configuration
- SLA monitoring
- Resource cleanup
- Logging and observability
:::

## Contract Requirements

### Minimal Contract

```yaml
fluidVersion: "0.7.2"
kind: Contract
id: my-pipeline
name: "My Data Pipeline"

metadata:
  provider: gcp
  
exposes:
  - id: customer_data
    name: "Customer Analytics"
    location:
      type: bigquery
      properties:
        dataset: analytics
        table: customers
```

### Full-Featured Contract

```yaml
fluidVersion: "0.7.2"
kind: Contract
id: advanced-pipeline
name: "Advanced Analytics Pipeline"

metadata:
  provider: gcp
  environment: prod
  owner: data-team
  tags: [analytics, ml, customer]

dependencies:
  - id: raw-data
    source: gs://raw-bucket/data/*.parquet
  
exposes:
  - id: transformed_customers
    name: "Customer Metrics"
    location:
      type: bigquery
      properties:
        dataset: analytics
        table: customer_metrics
    schema:
      - {name: customer_id, type: STRING}
      - {name: total_value, type: FLOAT64}
      - {name: last_purchase, type: TIMESTAMP}
    transforms:
      - type: sql
        path: sql/customer_aggregations.sql

schedule:
  cron: "0 2 * * *"
  timezone: "America/New_York"
  
monitoring:
  sla_seconds: 3600
  alert_email: data-ops@company.com
```

## Common Use Cases

### 1. Simple ETL Pipeline

**Scenario:** Load data from GCS to BigQuery daily

```bash
fluid generate-airflow gcs-to-bq.yaml -o dags/daily_load.py
```

### 2. Multi-Stage Transformation

**Scenario:** Extract → Transform → Load with multiple steps

```bash
fluid generate-airflow etl-pipeline.yaml \
  --output dags/etl_full.py \
  --env prod
```

### 3. Cross-Provider Pipeline

**Scenario:** AWS S3 → Processing → Snowflake

```bash
fluid generate-airflow s3-to-snowflake.yaml -o dags/cross_cloud.py
```

## Troubleshooting

### Issue: Import errors in generated DAG

**Cause:** Missing Airflow providers

**Solution:**
```bash
pip install apache-airflow-providers-google
pip install apache-airflow-providers-amazon
pip install apache-airflow-providers-snowflake
```

### Issue: Connection not found

**Cause:** Airflow connections not configured

**Solution:**
```bash
# Set up GCP connection
airflow connections add 'google_cloud_default' \
  --conn-type 'google_cloud_platform' \
  --conn-extra '{"key_path": "/path/to/service-account.json"}'
```

### Issue: Tasks failing immediately

**Cause:** Invalid contract configuration

**Solution:**
```bash
# Validate contract first
fluid validate contract.yaml --verbose

# Check provider configuration
fluid validate contract.yaml --provider gcp
```

## Integration with Airflow

### 1. Copy Generated DAG

```bash
# Generate DAG
fluid generate-airflow contract.yaml -o my_pipeline.py

# Copy to Airflow DAGs folder
cp my_pipeline.py $AIRFLOW_HOME/dags/
```

### 2. Verify DAG

```bash
# Check DAG syntax
python $AIRFLOW_HOME/dags/my_pipeline.py

# List DAGs
airflow dags list | grep my_pipeline

# Test DAG
airflow dags test my_pipeline 2026-01-30
```

### 3. Enable and Monitor

```bash
# Unpause DAG
airflow dags unpause my_pipeline

# Trigger manual run
airflow dags trigger my_pipeline

# Check status
airflow dags state my_pipeline
```

## Next Steps

- 📖 See [Airflow Walkthrough](../walkthrough/export-orchestration.md) for detailed examples
- 🔧 Learn about [contract validation](./validate.md)
- 📊 Explore [GCP provider features](../providers/gcp.md)
- 🚀 Check out [AWS provider capabilities](../providers/aws.md)

## Multi-Engine Export

The `fluid export` command supports all three engines:

```bash
# Airflow (also available via generate-airflow)
fluid export contract.yaml --engine airflow -o dags/

# Dagster
fluid export contract.yaml --engine dagster -o pipelines/

# Prefect
fluid export contract.yaml --engine prefect -o flows/
```

## See Also

- [validate command](./validate.md) - Validate contracts before generation
- [plan command](./plan.md) - Preview infrastructure changes
- [GCP Provider](../providers/gcp.md) - GCP-specific features
- [AWS Provider](../providers/aws.md) - AWS integration
- [Snowflake Provider](../providers/snowflake.md) - Data warehouse pipelines
