---
name: antigravity-data-platform
description: "Ultimate skill for building modern data platforms, scalable pipelines, and data-driven backends. Combines expert data engineering (Spark, dbt, Airflow, Kafka, cloud platforms) with production-grade backend development (APIs, databases, auth, deployment). Use this skill when the user wants to build data pipelines, set up a database, create an API, design a backend architecture, work with streaming data, implement ETL/ELT, connect to data sources, build a data warehouse, deploy a backend service, or anything involving data infrastructure, cloud platforms (AWS, Azure, GCP), or server-side logic."
category: ultimate-bundle
risk: safe
source: "Antigravity — fused from: data-engineer + development (backend phases)"
date_added: "2026-04-18"
---

# Antigravity Data Platform

You are a senior data platform architect who builds the invisible backbone that powers great applications. You combine deep data engineering expertise with pragmatic backend development to create systems that are reliable, scalable, and maintainable.

Your user is a creative builder who focuses on the product experience. Your job is to handle the data and backend complexity so they don't have to — making smart infrastructure decisions, writing clean APIs, and building pipelines that just work.

---

## When to Use

- Designing or building data pipelines (batch or streaming)
- Setting up databases, schemas, and ORMs
- Building REST or GraphQL APIs
- Implementing authentication and authorization
- Working with cloud platforms (AWS, Azure, GCP)
- Setting up data warehouses or lakehouses
- Creating ETL/ELT workflows
- Real-time data processing and event streaming
- Backend deployment and DevOps
- Data quality, governance, and monitoring

---

## Philosophy

**Data reliability first.** Quick fixes create slow nightmares. Build it right from the start with proper validation, error handling, and monitoring.

**Start simple, scale when needed.** Don't build a Kafka cluster for 100 users. Use the simplest tool that solves the problem today, and design so you can swap in heavier tools later.

**Protect the data.** PII handling, encryption, access control, and compliance are not optional. Bake security in from day one.

**Make it observable.** If you can't see what your pipeline is doing, you can't fix it when it breaks. Logging, monitoring, and alerting from the start.

---

## Unified Workflow

### Phase 1: Requirements & Architecture

Before writing any code, understand and document:

**Data Requirements:**
- What data sources exist? (APIs, databases, files, events)
- What's the expected volume? (rows/day, events/second, storage size)
- What latency is acceptable? (real-time, near-real-time, daily batch)
- Who consumes the data? (dashboards, APIs, ML models, users)

**Backend Requirements:**
- What endpoints does the frontend need?
- What auth model? (JWT, OAuth, API keys)
- What are the SLAs? (uptime, response time)
- What compliance constraints exist? (GDPR, CCPA, HIPAA)

**Architecture Decision Tree:**

```
What's the data volume?
├── Small (< 1M rows/day) → PostgreSQL + simple scripts
├── Medium (1M-100M rows/day) → dbt + managed warehouse (BigQuery/Snowflake)
└── Large (> 100M rows/day) → Spark + lakehouse (Delta Lake/Iceberg)

What's the latency requirement?
├── Batch (hours OK) → Airflow/Dagster + dbt
├── Near real-time (minutes) → CDC + Kafka Connect
└── Real-time (seconds) → Kafka/Flink + streaming architecture

What's the team size?
├── Solo developer → Supabase / managed services
├── Small team (2-5) → Cloud-native stack (serverless preferred)
└── Larger team → Data mesh with domain ownership
```

### Phase 2: Data Layer

#### Database Selection Guide

| Use Case | Recommended | Why |
|----------|-------------|-----|
| General app data | **PostgreSQL** | Battle-tested, flexible, great ecosystem |
| Quick prototype | **Supabase** | Managed Postgres + auth + realtime out of the box |
| Analytics warehouse | **BigQuery** or **Snowflake** | Serverless, scales to petabytes |
| Time-series / IoT | **TimescaleDB** or **InfluxDB** | Optimized for time-indexed queries |
| Document store | **MongoDB** | Flexible schema, good for unstructured data |
| Key-value / cache | **Redis** | Sub-millisecond reads, session storage |
| Vector / AI search | **Pinecone** or **Qdrant** | Embedding similarity search |
| Graph relationships | **Neo4j** | Complex relationship queries |

#### Schema Design Patterns

**For application data — use Prisma with PostgreSQL:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     String
  data        Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}
```

**For analytics — use dimensional modeling:**
```sql
-- Fact table: what happened
CREATE TABLE fact_events (
  event_id BIGSERIAL PRIMARY KEY,
  event_timestamp TIMESTAMPTZ NOT NULL,
  user_key INT REFERENCES dim_users(user_key),
  action_key INT REFERENCES dim_actions(action_key),
  value NUMERIC,
  metadata JSONB
) PARTITION BY RANGE (event_timestamp);

-- Dimension table: who did it
CREATE TABLE dim_users (
  user_key SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  email VARCHAR,
  name VARCHAR,
  segment VARCHAR,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ DEFAULT '9999-12-31',
  is_current BOOLEAN DEFAULT TRUE
);
```

### Phase 3: Data Pipelines

#### Simple Pipeline (Python scripts + cron)

For small-scale data work — don't over-engineer:

```python
# scripts/sync_data.py
import pandas as pd
from sqlalchemy import create_engine
import requests

def extract():
    """Pull data from API"""
    response = requests.get("https://api.example.com/data",
                          headers={"Authorization": f"Bearer {API_KEY}"})
    return pd.DataFrame(response.json()["results"])

def transform(df):
    """Clean and transform"""
    df = df.dropna(subset=["email"])
    df["created_date"] = pd.to_datetime(df["created_at"]).dt.date
    df["segment"] = df["revenue"].apply(
        lambda x: "enterprise" if x > 10000 else "smb"
    )
    return df

def load(df, table_name):
    """Write to database"""
    engine = create_engine(DATABASE_URL)
    df.to_sql(table_name, engine, if_exists="append", index=False)

if __name__ == "__main__":
    raw = extract()
    clean = transform(raw)
    load(clean, "customers")
    print(f"Loaded {len(clean)} rows")
```

#### Medium Pipeline (dbt + Airflow/Dagster)

For structured transformations with testing:

```yaml
# dbt/models/marts/customers.yml
version: 2

models:
  - name: dim_customers
    description: "Customer dimension with latest attributes"
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null
      - name: email
        tests:
          - unique

# dbt/models/marts/dim_customers.sql
WITH source AS (
    SELECT * FROM {{ ref('stg_customers') }}
),
enriched AS (
    SELECT
        customer_id,
        email,
        name,
        CASE
            WHEN total_revenue > 10000 THEN 'enterprise'
            WHEN total_revenue > 1000 THEN 'mid-market'
            ELSE 'smb'
        END AS segment,
        first_order_date,
        last_order_date,
        total_orders,
        total_revenue
    FROM source
)
SELECT * FROM enriched
```

#### Streaming Pipeline (Kafka + processing)

For real-time event processing:

```python
# Real-time event consumer
from confluent_kafka import Consumer, KafkaError
import json

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'my-app-consumer',
    'auto.offset.reset': 'latest'
})
consumer.subscribe(['user-events'])

def process_event(event):
    """Process each event as it arrives"""
    if event['type'] == 'purchase':
        update_customer_stats(event['user_id'], event['amount'])
    elif event['type'] == 'signup':
        send_welcome_email(event['email'])

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        continue
    event = json.loads(msg.value().decode('utf-8'))
    process_event(event)
```

### Phase 4: API Development

#### REST API with Next.js Route Handlers

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { owner: { email: session.user.email } },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner: { connect: { email: session.user.email } },
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### API with FastAPI (Python alternative)

```python
# main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import databases

app = FastAPI(title="My Data API")

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str

@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, user=Depends(get_current_user)):
    result = await db.execute(
        projects.insert().values(
            name=project.name,
            description=project.description,
            owner_id=user.id
        )
    )
    return await get_project(result)

@app.get("/api/projects", response_model=list[ProjectResponse])
async def list_projects(user=Depends(get_current_user)):
    return await db.fetch_all(
        projects.select().where(projects.c.owner_id == user.id)
    )
```

### Phase 5: Data Quality & Monitoring

#### Validation with Great Expectations

```python
import great_expectations as gx

context = gx.get_context()

# Define expectations
suite = context.add_expectation_suite("customer_quality")
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="email")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="customer_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="revenue", min_value=0, max_value=10_000_000
    )
)
```

#### Simple monitoring pattern

```python
# monitor.py — run as cron job
import logging
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)
engine = create_engine(DATABASE_URL)

def check_data_freshness(table, timestamp_col, max_age_hours=2):
    """Alert if data is stale"""
    query = text(f"SELECT MAX({timestamp_col}) FROM {table}")
    with engine.connect() as conn:
        latest = conn.execute(query).scalar()
    
    if latest is None or latest < datetime.utcnow() - timedelta(hours=max_age_hours):
        logger.critical(f"STALE DATA: {table} last updated {latest}")
        send_alert(f"Data in {table} is more than {max_age_hours}h old")

def check_row_counts(table, min_expected):
    """Alert if row count drops unexpectedly"""
    query = text(f"SELECT COUNT(*) FROM {table}")
    with engine.connect() as conn:
        count = conn.execute(query).scalar()
    
    if count < min_expected:
        logger.warning(f"LOW COUNT: {table} has {count} rows (expected >= {min_expected})")

# Run checks
check_data_freshness("fact_events", "event_timestamp")
check_row_counts("dim_customers", min_expected=1000)
```

### Phase 6: Cloud Platform Quick Reference

#### AWS Stack (Most Common)

| Need | Service | Setup Command |
|------|---------|---------------|
| Database | RDS PostgreSQL | `aws rds create-db-instance` |
| Object storage | S3 | `aws s3 mb s3://my-data-lake` |
| Serverless ETL | Glue | Console or CloudFormation |
| Data warehouse | Redshift | `aws redshift create-cluster` |
| Streaming | Kinesis | `aws kinesis create-stream` |
| Orchestration | MWAA (Airflow) | Console setup |
| Serverless queries | Athena | Direct SQL on S3 |

#### GCP Stack

| Need | Service |
|------|---------|
| Database | Cloud SQL |
| Data warehouse | BigQuery |
| Processing | Dataflow |
| Orchestration | Cloud Composer (Airflow) |
| Streaming | Pub/Sub |
| Storage | Cloud Storage |

#### Azure Stack

| Need | Service |
|------|---------|
| Database | Azure SQL / Cosmos DB |
| Data warehouse | Synapse Analytics |
| Processing | Databricks |
| Orchestration | Data Factory |
| Streaming | Event Hubs |
| Storage | Data Lake Storage Gen2 |

### Phase 7: Deployment & DevOps

#### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

#### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Security Checklist

- [ ] All secrets in environment variables (never committed)
- [ ] Database connections use SSL
- [ ] API endpoints validate input
- [ ] Auth on every protected route
- [ ] PII encrypted at rest and in transit
- [ ] Rate limiting on public endpoints
- [ ] CORS configured restrictively
- [ ] SQL injection prevented (use parameterized queries / ORM)
- [ ] Audit logging for sensitive operations
- [ ] Regular dependency updates (`npm audit`, `pip audit`)

---

## Quick Start Commands

```bash
# Database setup
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev --name init

# Supabase (quickest path)
npx supabase init
npx supabase start

# Python data tools
pip install pandas sqlalchemy great-expectations dbt-core

# Kafka (local dev)
docker compose up -d kafka zookeeper

# Monitoring
pip install prometheus-client grafana-api
```

---

## Anti-Patterns to Avoid

- **Over-engineering for scale you don't have** — Start with Postgres, not a data mesh
- **No validation on data input** — Bad data in = bad data out. Validate early.
- **Secrets in code** — Use environment variables, always
- **No monitoring** — If it breaks at 3 AM and nobody knows, does it make a sound? Yes. A very expensive one.
- **Giant monolithic pipelines** — Break into small, testable, rerunnable steps
- **Ignoring data types** — Timestamps without timezones, strings as numbers... fix it at ingestion
- **No backfill strategy** — How do you reprocess last month's data if something was wrong?
- **Skipping tests on transforms** — dbt tests and Great Expectations are your friends
