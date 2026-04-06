# n8n-nodes-kitsu

> Community node for [n8n](https://n8n.io) that provides full access to the [Kitsu / CGWire](https://kitsu.cg-wire.com) production management API (powered by [Zou](https://zou.cg-wire.com)).

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Kitsu API](https://img.shields.io/badge/Kitsu%20API-Zou-5a73db)

---

## What is Kitsu?

[Kitsu](https://kitsu.cg-wire.com) is an open-source production tracking platform for animation and VFX studios, developed by [CGWire](https://cg-wire.com). It allows studios to track tasks, review assets and shots, manage teams and deadlines — all via a REST API called **Zou**.

This n8n node exposes the entire Zou API as native n8n operations, enabling you to build automation workflows, AI agents, and integrations around your production pipeline.

---

## Features

Full CRUD access to all main Kitsu resources:

| Resource | Operations |
|---|---|
| **Project** | Get, Get All, Create, Update, Delete |
| **Shot** | Get, Get All, Create, Update, Delete |
| **Asset** | Get, Get All, Create, Update, Delete |
| **Task** | Get, Get All, Create, Update, Delete |
| **Sequence** | Get, Get All, Create, Update, Delete |
| **Episode** | Get, Get All, Create, Update, Delete |
| **Person** | Get, Get All, Create, Update, Delete |
| **Task Status** | Get, Get All, Create, Update, Delete |
| **Task Type** | Get, Get All, Create, Update, Delete |
| **Comment** | Get All (for Task), Create, Update, Delete |
| **Preview File** | Get, Get All (for Task) |
| **Custom Action** | Execute any endpoint (GET / POST / PUT / PATCH / DELETE) |

### Authentication
JWT-based. The node logs in automatically at execution time using your email and password — no manual token management required.

---

## Installation

### Self-hosted n8n (recommended)

```bash
# Navigate to your n8n custom extensions folder (default: ~/.n8n)
npm install --prefix ~/.n8n n8n-nodes-kitsu
# Then restart n8n
```

Or with Docker, add to your `docker-compose.yml`:

```yaml
environment:
  - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n
```

```dockerfile
FROM n8nio/n8n:latest
USER root
RUN npm install --prefix /home/node/.n8n n8n-nodes-kitsu
USER node
```

### Manual install from source

```bash
git clone https://github.com/Aiacos/n8n-nodes-kitsu.git
cd n8n-nodes-kitsu
npm install
npm run build
# Then copy the dist/ folder into your n8n custom extensions path
```

---

## Credentials Setup

1. In n8n go to **Credentials → New → Kitsu API**
2. Fill in:
   - **Kitsu Host URL** — e.g. `https://kitsu.yourstudio.com` (no trailing slash)
   - **Email** — your Kitsu account email
   - **Password** — your Kitsu account password

---

## Usage Examples

See the [`examples/`](./examples) folder for ready-to-import n8n workflow JSON files:

| File | Description |
|---|---|
| [`workflow-1-ai-comment-analysis.json`](./examples/workflow-1-ai-comment-analysis.json) | AI reads task comments and posts a summary back to Kitsu |
| [`workflow-2-ai-task-supervisor.json`](./examples/workflow-2-ai-task-supervisor.json) | AI agent monitors tasks in Review and takes automatic actions |
| [`workflow-3-chatbot-production.json`](./examples/workflow-3-chatbot-production.json) | Chat-based AI assistant with full Kitsu access as tools |

Import any workflow via **n8n → Workflows → Import from file**.

---

## Custom Action

The **Custom Action** resource lets you call any Zou endpoint not yet covered by the built-in operations:

- Set HTTP method, path, query string and JSON body freely
- Useful for: `/actions/projects/{id}/set-preview`, `/export/projects/all`, `/data/entities/{id}/casting`, etc.

Example path: `/actions/tasks/{task_id}/set-main-preview`

---

## Environment Variables (for workflows)

The example workflows use these n8n Variables (Settings → Variables):

| Variable | Description |
|---|---|
| `KITSU_PROJECT_ID` | UUID of your default project |
| `KITSU_STATUS_REVIEW_ID` | UUID of the "Review" task status |
| `KITSU_DEFAULT_SUPERVISOR_ID` | UUID of the default supervisor person |

---

## Project Structure

```
n8n-nodes-kitsu/
├── credentials/
│   └── KitsuApi.credentials.ts     # Credential type definition
├── nodes/
│   └── Kitsu/
│       ├── Kitsu.node.ts           # Main node implementation
│       └── kitsu.svg               # Node icon
├── examples/
│   ├── workflow-1-ai-comment-analysis.json
│   ├── workflow-2-ai-task-supervisor.json
│   └── workflow-3-chatbot-production.json
├── dist/                           # Compiled JS (auto-generated)
├── index.ts                        # Package entry point
├── package.json
└── tsconfig.json
```

---

## Development

```bash
# Install dependencies
npm install

# Watch mode (recompiles on save)
npm run dev

# Full build
npm run build

# Lint
npm run lint
```

---

## Links

- [Kitsu API Docs](https://api-docs.kitsu.cloud)
- [Zou GitHub](https://github.com/cgwire/zou)
- [Gazu Python Client](https://github.com/cgwire/gazu)
- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)

---

## License

MIT © [Aiacos](https://github.com/Aiacos)
