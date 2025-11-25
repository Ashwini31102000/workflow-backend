# Workflow Automation Platform — Backend

Node.js + Express + MongoDB backend for a simple workflow automation/orchestration platform.

## Features

- JWT-based authentication (register/login)
- CRUD for workflows
- Define workflow steps (HTTP / Delay / Log)
- Manual workflow execution with step-by-step execution log
- Execution history API

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

APIs:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/workflows`
- `POST /api/workflows`
- `PUT  /api/workflows/:id`
- `DELETE /api/workflows/:id`
- `POST /api/workflows/:id/execute`
- `GET  /api/executions`
# workflow-backend
