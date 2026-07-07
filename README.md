# data_gateway

HTTP API for the **Data Console** (`data_web`). Reads operational data from PostgreSQL and serves authenticated console users.

Express service: CORS → logging → IP whitelist (non-dev) → rate limit → JWT → role check → handler → repository.

---

## Project structure

```
data_gateway/
├── Dockerfile
├── .env.example          # Environment template
├── package.json
└── src/
    ├── app.ts            # Process entry; registers signal handlers
    ├── handlers/
    │   └── process.ts    # SIGSTART / SIGINT / SIGTERM lifecycle
    ├── init.ts           # Startup & shutdown orchestration
    ├── config.ts         # Environment variables
    ├── type.ts           # Shared domain types
    │
    ├── modules/          # Infrastructure clients
    │   ├── cache.ts      # Redis (rate limiter backend)
    │   ├── jwt.ts        # JWT key loading & verification helpers
    │   └── pg.ts         # PostgreSQL pool
    │
    ├── repositories/     # SQL layer (one file per domain)
    │   ├── bot.ts
    │   ├── chatHistory.ts
    │   ├── dataLookup.ts
    │   ├── knowledge.ts
    │   ├── mcpCapability.ts
    │   ├── monitorLog.ts
    │   ├── user.ts
    │   ├── userBehaviorLog.ts
    │   └── userMemory.ts
    │
    ├── services/         # Non-HTTP service helpers
    │   ├── index.ts      # Init / teardown
    │   ├── maxmind.ts    # IP geolocation
    │   └── GeoLite2-City.mmdb   # Bundled at build (gitignored)
    │
    ├── errors/
    │   └── postgres.ts   # Postgres error → app error codes
    │
    └── server/
        ├── index.ts      # Express app, middleware chain, route mounts
        ├── express.d.ts  # Request type extensions (req.user)
        ├── apis/
        │   ├── health/   # GET /health, GET /ready
        │   └── data/     # POST /data/* (see below)
        ├── midwares/
        │   ├── auth.ts       # Logging, IP whitelist, JWT
        │   ├── permission.ts # roleCheck
        │   └── security.ts   # Rate limiting
        └── modules/
            ├── errs.ts     # errno / errmsg response shape
            └── limiter.ts  # Redis rate limiter
```

### Layer convention (`/data` APIs)

Each endpoint follows the same stack:

```
index.ts   → route + roleCheck
midware.ts → try/catch, default empty result
handler.ts → business logic (e.g. MaxMind enrichment)
repository → SQL queries
```

---

## Routes

| Prefix | Auth | Endpoints |
|--------|------|-----------|
| `/` | — | `GET /health`, `GET /ready` |
| `/data` | JWT + rate limit | POST data APIs below |

Response shape: `{ errno, errmsg, data }`. JWT payload on `req.user`: `{ userId, botId, soulId, role, jti }`.

---

## Data APIs

All **POST** under `/data`, JSON body. List endpoints accept `page`, `pageSize`, `sortBy`, `order`, plus entity filters.

| Route | Description |
|-------|-------------|
| `/data/getBots` | Paginated bots |
| `/data/getKnowledge` | Paginated knowledge |
| `/data/getMcpCapabilities` | Paginated MCP capabilities |
| `/data/getMonitorLogsTrace` | Trace detail by `traceId` |
| `/data/getUsers` | Paginated users |
| `/data/getUserBehaviorLogs` | Aggregated behavior logs (IP → country via MaxMind) |
| `/data/getUserBehaviorStats` | Dashboard stats: totals, sessions, regions, media clicks |
| `/data/getUserMemory` | Memory text by `userId` + `soulId` |
| `/data/getChatActiveDates` | Active chat dates in a month (`Asia/Shanghai`) |
| `/data/getChatHistories` | Chat messages for a local date |
| `/data/getDataLookup` | Raw rows by entity + ids |

Roles: all routes currently use `roleCheck([1, 5])` in [`src/server/apis/data/index.ts`](src/server/apis/data/index.ts).

**Data lookup** entities: see `TABLE_MAP` in [`src/repositories/dataLookup.ts`](src/repositories/dataLookup.ts).

---

## Extend

**New endpoint:** repository → handler → midware → register in `apis/data/index.ts`.

**New lookup entity:** add to `TABLE_MAP` in `dataLookup.ts` (+ frontend type).

---

## Environment

Copy `.env.example` to `.env`. Key groups:

| Group | Variables |
|-------|-----------|
| Basic | `SERVICE_NAME`, `NODE_ENV`, `HTTP_PORT`, `CORS_ORIGINS`, `IP_WHITELIST` |
| Auth | `AUTH_HOST`, `AUTH_PORT` |
| Redis | `REDIS_HOSTS`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USE_CLUSTER`, `REDIS_USE_TLS` |
| PostgreSQL | `PG_HOST`, `PG_PORT`, `PG_USERNAME`, `PG_PASSWORD`, `PG_DATABASE`, `PG_MAX_CONNECTIONS`, `PG_USE_TLS` |
| Other | `PLATFORM_LIST` |

GeoLite2 (`src/services/GeoLite2-City.mmdb`) is copied to `dist/services/` on `npm run build`. File is gitignored; place it locally before building.

Container runtime: env vars must be injected at deploy time (see `Dockerfile`); `.env` is not baked into the image.

---

## Scripts

```bash
npm run dev     # build + run with .env
npm run build   # eslint + tsc + copy errors/ and GeoLite2 mmdb
npm start       # production (dist/)
```

**Shutdown** (`SIGINT` / `SIGTERM`): HTTP server → Redis → PostgreSQL → MaxMind.
