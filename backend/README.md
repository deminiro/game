# Game Backend

NestJS + PostgreSQL scaffold for a game backend with domain module placeholders (`Auth`, `User`, `Game`, `Wallet`) and a working `Mock` CRUD module to demonstrate the full stack.

## Stack

- Node.js 22 + TypeScript (strict)
- NestJS 11
- Prisma ORM 6 + PostgreSQL 16
- class-validator / class-transformer for DTO validation
- @node-rs/argon2 for password hashing (Argon2id, OWASP-recommended)
- nestjs-pino for structured logging
- @nestjs/swagger for OpenAPI docs
- @nestjs/terminus for health checks
- Docker Compose for local dev

## Quick start (Docker, recommended)

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:3000/api/v1
- Swagger docs: http://localhost:3000/api/docs
- Health check: http://localhost:3000/api/v1/health

Hot reload is enabled: editing files under `src/` triggers `nest start --watch` inside the container (polling is enabled for Windows/WSL compatibility).

## Local Node + Dockerized DB

If you prefer running Node on your host:

```bash
docker compose up -d db
npm install
npx prisma migrate dev
npm run start:dev
```

Set `DATABASE_URL` in `.env` to `postgresql://postgres:postgres@localhost:5432/game_backend?schema=public` when running outside the compose network.

## Useful commands

| Command                         | What it does                  |
| ------------------------------- | ----------------------------- |
| `npm run start:dev`             | Start Nest with watch mode    |
| `npm run build`                 | Compile to `dist/`            |
| `npm run start:prod`            | Run compiled app              |
| `npm run lint`                  | ESLint with auto-fix          |
| `npm run format`                | Prettier write                |
| `npm test`                      | Unit tests                    |
| `npm run prisma:generate`       | Regenerate Prisma client      |
| `npm run prisma:migrate`        | Create/apply dev migration    |
| `npm run prisma:migrate:deploy` | Apply migrations in CI/prod   |
| `npm run prisma:studio`         | Open Prisma Studio            |
| `npm run db:reset`              | Drop + recreate DB (dev only) |

## Project layout

```
src/
  main.ts                      # bootstrap, global pipes/filters, Swagger, versioning
  app.module.ts                # root module wiring
  config/                      # env validation + AppConfigService
  common/
    filters/                   # global exception filter
  database/                    # PrismaService + PrismaModule
  health/                      # /health endpoint via terminus
  modules/
    auth/                      # placeholder (NotImplementedException)
    user/                      # placeholder
    game/                      # placeholder
    wallet/                  # placeholder
    mock/                      # working CRUD sample
      dto/
      entities/
      mock.controller.ts
      mock.service.ts
      mock.module.ts
prisma/
  schema.prisma                # Prisma data models
```

## Conventions

- Feature-first modules under `src/modules/<feature>` with controller/service/module split.
- DTOs in `dto/`, response entities in `entities/`, strict validation via class-validator.
- All routes are versioned via URI (`/api/v1/...`) and grouped in Swagger tags.
- Global `ValidationPipe` enforces `whitelist`, `forbidNonWhitelisted`, and `transform`.
- All unhandled errors flow through `AllExceptionsFilter` producing a consistent JSON shape.
- Cross-module communication only via exported providers; no deep relative imports.
- Secrets and env are validated at bootstrap (Joi schema) and accessed via `AppConfigService`.

## Validation checklist

- [ ] `docker compose up --build` brings up `db` and `api` cleanly
- [ ] `GET /api/v1/health` returns `status: "ok"` with `database: up`
- [ ] `POST /api/v1/mocks` creates a record; `GET /api/v1/mocks` lists it
- [ ] Invalid payload returns 400 via global `ValidationPipe`
- [ ] Editing `src/**/*.ts` triggers a reload without rebuilding the container

## Troubleshooting

- Hot reload not firing on Windows: `CHOKIDAR_USEPOLLING=true` is set in compose; ensure Docker Desktop has access to the project drive.
- DB connection refused at startup: the `api` service waits for `db` healthcheck; first boot can take ~10s.
- After changing `prisma/schema.prisma`: run `npm run prisma:migrate` (dev) or `npm run prisma:migrate:deploy` (CI).
