# service_gateway

API Gateway between frontends and internal services. Refactored stack with lightweight telemetry (W3C-style trace IDs, no OpenTelemetry SDK dependency).

## Intro

The gateway exposes **Express HTTP APIs** and a **WebSocket** endpoint for real-time traffic. After validation (JSON, auth, rate limits, IP rules), work is forwarded via **Redis** (Pub/Sub, Lists, Streams), **RabbitMQ**, or direct HTTP to downstream services; responses may return over WebSocket or HTTP depending on the flow.

Clients that rely on push/async flows should follow the API docs and maintain an active WebSocket where required.

**Features**

- WebSocket as a primary channel for interactive flows
- REST HTTP APIs (`/auth`, `/common`, `/health`, `/slack`, …)
- Lightweight tracing: `traceId` / `spanId`, AsyncLocalStorage, optional Redis Stream export
- Redis: cache, Pub/Sub, Lists (task queues), Streams (telemetry pipeline)
- RabbitMQ for cross-service messaging (optional)
- PostgreSQL via `pg` pool (optional)
- JWT, rate limiting, graceful shutdown

**Highlights**

- Multi-instance WebSocket coordination via Redis Pub/Sub
- Connections keyed by `botId` + `soulId`
- HTTP: inbound `traceparent` parsed in middleware; responses echo `traceparent`
- Outbound HTTP (e.g. to `auth_service`): callers should attach `traceparent` from `getCurrentTraceContext()` when telemetry is enabled so downstream HTTP middleware can join the same trace

---

## Folder structure

```
├── keys/                 JWT keys (when not loaded from auth service)
├── public/               Static assets / docs (optional)
├── src/
│   ├── app.ts            Process entry
│   ├── config.ts         Env-driven configuration
│   ├── init.ts           Init sequence + graceful shutdown hooks
│   ├── type.ts           Shared TypeScript types (including SpanRecord, telemetry)
│   ├── errors/           Postgres error mapping, etc.
│   ├── handlers/
│   │   ├── process.ts    Signals, uncaught exceptions
│   │   ├── wrapper.ts    onInvoke() — wraps work in startSpan/endSpan + ALS
│   │   ├── telemetry/    Span sink helpers (e.g. Redis Stream publish errors)
│   │   ├── messenger/    Redis Pub/Sub (subscribe, unsubscribe, chat, …)
│   │   ├── msglist/      Redis List consumers (e.g. chat task replies)
│   │   ├── socket/       WebSocket upgrade, connection, chat, logout
│   │   └── stream/       Redis Stream consumers (optional)
│   ├── modules/
│   │   ├── telemetry.ts  initTelemetry, startSpan, endSpan, ALS, getCurrentTraceContext
│   │   ├── cache.ts, messenger.ts, msglist.ts, redisStream.ts
│   │   ├── mq.ts, pg.ts (node-pg Pool), jwt.ts, socket.ts
│   │   └── s3.ts         AWS helpers (optional)
│   ├── repositories/     DB accessors (user, media, …)
│   ├── services/         Resend, Slack, AWS wrappers
│   ├── utils/
│   ├── rabbitmq/         Connection setup + topic handlers
│   └── server/
│       ├── index.ts      Express app: middleware order, route mounts
│       ├── express.d.ts  Request augmentation (e.g. httpTelemetryParent)
│       ├── apis/
│       │   ├── auth/      Login, signup, refresh, Google, …
│       │   ├── common/    Shared utilities
│       │   ├── health/    Health checks
│       │   └── slack/     Slack Events API (custom JSON handling on `/slack`)
│       ├── midwares/
│       │   ├── trace.ts   httpTraceMiddleware, wrapRoute
│       │   ├── auth.ts    IP whitelist, JWT helpers, logging
│       │   └── security.ts Rate limiting (used on `/auth` routes)
│       └── modules/       errs.ts, limiter.ts, pending.ts
├── .env / .env.example
├── package.json
├── tsconfig.json
└── README.md
```

**HTTP route mounts** ([`src/server/index.ts`](src/server/index.ts)): `/` → health, `/slack` → Slack router (global JSON parser is skipped for `/slack` so Slack signatures work), `/common`, `/auth` (with rate limiter middleware).

---

## Request flow (short)

**HTTP**

1. Optional conditional JSON body parser (non-`/slack` routes).
2. `httpTraceMiddleware`: read inbound `traceparent`, create span, `runInTraceContext`, attach `req.httpTelemetryParent`, set response `traceparent`.
3. Auth / IP / rate limits as configured.
4. Route handlers often wrapped with `wrapRoute` (nested span under the HTTP span).

**WebSocket**

1. `startSpan('ws.upgrade')` during HTTP upgrade; validate query params + JWT.
2. Persist `traceId` and upgrade span id on `(req as WsIncomingMessage).body`.
3. After successful upgrade: `onInvoke('ws.connect' | 'ws.message' | 'ws.error', …)` shares the same `traceId` with child spans.

---

## Telemetry module ([`src/modules/telemetry.ts`](src/modules/telemetry.ts))

**Exports (all used in-repo)**

| Export | Role |
|--------|------|
| `initTelemetry` | Registers span sink (`onSpanHandler`), service name, env |
| `telemetryConfigured` | Guards middleware/handlers when telemetry is off |
| `runInTraceContext` | Bind `TraceContext` into AsyncLocalStorage |
| `startSpan` / `endSpan` | Create/close spans and emit `SpanRecord` |
| `getCurrentTraceContext` | Read ALS context (HTTP handlers, chat, outbound axios headers) |

There is **no** `withSpan` helper; synchronous/async wrapping for Redis/Rabbit handlers uses **`onInvoke`** from [`src/handlers/wrapper.ts`](src/handlers/wrapper.ts).

**`onInvoke` behavior**: If telemetry is disabled **or** `opts.traceAttributes` is missing/empty, the handler runs **without** a span. To force a span for messenger/msglist-style code paths, pass at least one `traceAttributes` entry (e.g. `{ traceAttributes: { botId, soulId }, meta: { … } }`).

**Outbound HTTP**: Inside a traced Express handler, use `getCurrentTraceContext()` (only after `initTelemetry`) and set Axios/fetch header:

`traceparent: 00-${traceId}-${spanId}-${sampled ? '01' : '00'}`

Match flags with [`startSpan`](src/modules/telemetry.ts) (`sampled`). Peer services (for example **auth_service**) should expose the same HTTP trace middleware pattern: parse inbound `traceparent`, create a child span, echo `traceparent` on the response.

**Span payload shape** ([`SpanRecord`](src/type.ts)):

```typescript
{
  service: string
  env?: string
  instanceId?: number       // process.pid when emitted
  traceId: string           // 32 hex chars
  spanId: string            // 16 hex chars
  parentSpanId?: string
  name: string
  startTimeMs: number
  durationMs: number
  status: 'ok' | 'error'
  traceAttributes?: Record<string, string>  // e.g. botId, soulId
  meta?: Record<string, unknown>
  error?: { message: string; stack?: string }
}
```

Optional Redis Stream sink: spans are written via `pushToStream` / monitor streams as configured in init (see existing env docs).

---

## How to extend

### New REST API

1. Add `src/server/apis/<name>/` with `index.ts` (Router + `wrapRoute`), `midware.ts`, `handler.ts`.
2. Register in [`server/index.ts`](src/server/index.ts): `listener.use('/prefix', …, yourRouter)`.
3. Outbound calls to other services: propagate `traceparent` as above when telemetry is on.

Example route registration:

```typescript
import { Router } from 'express'
import { wrapRoute } from '../../midwares/trace'
import { myMidware } from './midware'

const router = Router()
router.post('/path', wrapRoute('/api/path', myMidware))
export default router
```

### Redis Pub/Sub handler

Use `onInvoke` from [`handlers/wrapper.ts`](src/handlers/wrapper.ts) (see [`handlers/messenger/index.ts`](src/handlers/messenger/index.ts)) instead of a non-existent `withSpan`.

### Redis List (msglist)

Same pattern: [`handlers/msglist/index.ts`](src/handlers/msglist/index.ts) + `onInvoke`.

### RabbitMQ

Extend [`rabbitmq/handlers/index.ts`](src/rabbitmq/handlers/index.ts); wiring lives under [`rabbitmq/index.ts`](src/rabbitmq/index.ts).

---

## Environment variables

See `.env.example` for the full list. Common entries include:

- `HTTP_PORT`, `AUTH_HOST` / `AUTH_PORT`, `KEYPAIR_PATH`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `CHANNEL_LIST`, `MSG_LIST_LISTEN`, `REDIS_STREAMS_CONFIG`
- RabbitMQ: `MQ_*`, `MQ_ROUTING_KEYS_LISTEN`, `MQ_QUEUE_CONSUME`
- Postgres: `PG_*`
- `IP_WHITELIST` (non-dev)

---

## Conventions

**RabbitMQ routing keys** (example):

`from_service.to_service.task.function[.RESULT]`

**Redis list keys** for task flows often follow `service:route:STATUS` patterns; align with downstream consumers.

---

## Scripts

```bash
npm run dev    # build + run with .env
npm run build
npm start      # production entry (see package.json)
```

---

## Graceful shutdown

[`init.ts`](src/init.ts) coordinates stopping HTTP/WebSocket, Redis, RabbitMQ, Postgres, and related loops on `SIGINT` / `SIGTERM`.
