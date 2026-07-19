# data_gateway

Internal data query service for `data_web`. It provides APIs for users, chat, hardware, software packages, resources, logs, and common data lookup.

## Features

- `health`: service health checks
- `chat`: chat active dates and chat histories
- `common`: common data lookup
- `hardware`: robot and hardware queries
- `log`: monitor log trace queries
- `resource`: Knowledge and MCP Capabilities queries
- `software`: software package list, versions, and uploads
- `user`: user list, permissions, behavior logs, behavior stats, and memory

## Structure

- `src/server/apis/`: HTTP APIs grouped by feature
- `src/server/midwares/`: auth, permission, rate limit, and error middleware
- `src/repositories/`: data query layer
- `src/services/`: service helpers and external resources
- `src/modules/`: PostgreSQL, Redis, JWT, and other base modules

## API Groups

- `GET /health`
- `GET /ready`
- `/chat/*`
- `/common/*`
- `/hardware/*`
- `/log/*`
- `/resource/*`
- `/software/*`
- `/user/*`

Except for health checks, APIs go through rate limit, JWT, and permission checks.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

`npm run build` compiles TypeScript and copies `src/errors` and `src/services/GeoLite2-City.mmdb` to `dist`.
