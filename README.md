# data_gateway

HTTP API backend for the **Data Console** (`data_web`). Reads operational data from PostgreSQL and exposes it to authenticated console users.

## Intro

The gateway is a focused Express service: no WebSocket, message queues, or telemetry pipeline. Incoming requests pass through CORS, logging, IP whitelist (non-dev), rate limiting, and JWT verification before reaching data handlers.

**Features**

- REST APIs under `/data` for bots, users, knowledge, logs, chat history, and raw ID lookup
- JWT auth via `auth` header (RS256 public key fetched from auth service)
- Role-based access control on each route (`roleCheck`)
- PostgreSQL via `pg` pool
- Redis for HTTP rate limiting
- MaxMind GeoLite2 for IP geolocation in user behavior logs

---

## Project layout

```
data_gateway/
├── Dockerfile
├── .env.example
├── package.json
└── src/
    ├── app.ts                 Process entry & signals
    ├── init.ts                Startup / shutdown
    ├── config.ts              Environment variables
    ├── type.ts                Shared domain types
    ├── errors/                Postgres error mapping
    ├── types/                 Global TS augmentations (e.g. SIGSTART)
    ├── handlers/              Process lifecycle (SIGSTART, SIGINT, …)
    ├── modules/               cache · jwt · pg
    ├── repositories/          SQL layer (bot, user, chat, logs, lookup, …)
    ├── services/              MaxMind + GeoLite2-City.mmdb
    └── server/
        ├── index.ts           Express app & route mounts
        ├── apis/
        │   ├── data/          index · midware · handler
        │   └── health/        index · midware · handlers
        ├── midwares/          auth · permission · security
        └── modules/           errs · limiter
```

**Routes** ([`src/server/index.ts`](src/server/index.ts)):

| Prefix | Middleware | Endpoints |
|--------|------------|-----------|
| `/` | — | `GET /health`, `GET /ready` |
| `/data` | rate limit → JWT | POST data console APIs |

Each API follows **index → midware → handler → repository**.

---

## Request flow

1. `express.json()` parses the body.
2. CORS, request logging, IP whitelist (skipped in `dev`).
3. On `/data`: Redis rate limiter, then JWT verification (`auth` header).
4. Route handler runs `roleCheck`, then handler logic → repository → PostgreSQL.
5. Response shape: `{ errno, errmsg, data }` (see [`server/modules/errs.ts`](src/server/modules/errs.ts)).

JWT payload is attached to `req.user`:

```typescript
{ userId, botId, soulId, role, jti }
```

---

## Data APIs

All routes are **POST** under `/data`. Request bodies are JSON.

| Route | Description |
|-------|-------------|
| `/data/getBots` | Paginated bot list with filters and sort |
| `/data/getKnowledge` | Paginated knowledge entries |
| `/data/getMcpCapabilities` | Paginated MCP capabilities |
| `/data/getMonitorLogsTrace` | Monitor trace detail by `traceId` |
| `/data/getUsers` | Paginated user list |
| `/data/getUserBehaviorLogs` | Aggregated behavior logs (with IP geolocation) |
| `/data/getUserMemory` | User memory text by `userId` + `soulId` |
| `/data/getChatActiveDates` | Active chat dates in a month (`userId`, `currentTime`) |
| `/data/getChatHistories` | Chat messages for a local date (`userId`, `soulId`, `date`) |
| `/data/getDataLookup` | Raw rows by entity + ids |

**Role access** ([`src/server/apis/data/index.ts`](src/server/apis/data/index.ts)): routes currently require role `1` or `5`. Adjust `roleCheck([...])` per route as needed.

**List endpoints** accept `page`, `pageSize`, `sortBy`, `order`, plus entity-specific filter fields in the body.

**Data lookup** supports entities defined in [`repositories/dataLookup.ts`](src/repositories/dataLookup.ts): `authProviders`, `bots`, `chatHistories`, `chatTopics`, `knowledge`, `mcpCapabilities`, `media`, `monitorLogs`, `users`, `userBehaviorLogs`, `userMemories`.

**Chat dates** use `Asia/Shanghai` for month/day boundaries. `currentTime` can be any instant in the target month; the handler queries that full calendar month.

---

## How to extend

### New data endpoint

1. Add query logic in `src/repositories/<domain>.ts`.
2. Add handler in `src/server/apis/data/handler.ts`.
3. Add middleware wrapper in `src/server/apis/data/midware.ts`.
4. Register route in `src/server/apis/data/index.ts` with `roleCheck`.

Example:

```typescript
router.post('/getExample', roleCheck([1, 5]), _getExample)
```

### New lookup entity

Add the entity key and table name to `TABLE_MAP` in [`repositories/dataLookup.ts`](src/repositories/dataLookup.ts), and mirror the type on the frontend.

---

## Environment variables

See `.env.example` for a full template. Variables used at runtime:

| Variable | Required | Notes |
|----------|----------|-------|
| `SERVICE_NAME` | yes | Service identifier |
| `NODE_ENV` | yes | `dev` skips IP whitelist |
| `HTTP_PORT` | yes | HTTP listen port |
| `CORS_ORIGINS` | yes | Comma-separated allowed origins |
| `IP_WHITELIST` | non-dev | Comma-separated IPs; `*` wildcards supported |
| `AUTH_HOST`, `AUTH_PORT` | yes | Auth service for JWT public key |
| `REDIS_HOSTS`, `REDIS_PORT`, `REDIS_PASSWORD` | yes | Rate limiter backend |
| `REDIS_USE_CLUSTER`, `REDIS_USE_TLS` | no | Redis connection options |
| `PG_HOST`, `PG_PORT`, `PG_USERNAME`, `PG_PASSWORD`, `PG_DATABASE` | yes | PostgreSQL |
| `PG_MAX_CONNECTIONS`, `PG_USE_TLS` | no | Pool size and TLS |

GeoLite2 database (`GeoLite2-City.mmdb`) is bundled under `src/services/` and copied to `dist/services/` on build.

---

## Scripts

```bash
npm run dev     # build + run with .env
npm run build   # eslint + tsc + copy assets
npm start       # production entry (see package.json)
```

---

## Graceful shutdown

[`handlers/process.ts`](src/handlers/process.ts) on `SIGINT` / `SIGTERM`:

1. Stop HTTP server
2. Disconnect Redis
3. Close PostgreSQL pool
4. Tear down MaxMind client
