# Heaven Pass

Plataforma de membresías premium de acceso a fiestas — temporada Punta del Este 2025-2026.

Los miembros pagan una membresía (Basic, VIP o Black) que les da un número fijo de accesos
para reservar del catálogo de fiestas de la temporada, por orden de llegada y con cupos
limitados por evento.

## Stack

Monorepo con [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turborepo.dev/).

```
apps/
  api/            Node.js + Hono + Prisma (PostgreSQL)
  mobile/         React Native + Expo Router
packages/
  types/          Enums, catálogo de planes/extras, DTOs compartidos api <-> mobile
  validations/    Schemas de zod para requests de la API (reusables en forms de mobile)
  utils/          Formato de moneda, fechas, paginación, slugify
```

## Modelo de negocio

| Plan  | Precio | Accesos            |
| ----- | ------ | ------------------- |
| Basic | $490   | 5 accesos GENERAL   |
| VIP   | $790   | 6 accesos VIP        |
| Black | $1.190+| 6 accesos BACKSTAGE |

Ingresos adicionales: upgrades in-app (General → VIP, ~$35), late entry post 2am ($15-20),
seguro de clima para fiestas al aire libre ($25), fee por segunda cancelación ($20).
Ver `packages/types/src/catalog.ts` para los valores exactos usados por la API.

## Empezar

```bash
corepack enable # si no tenés pnpm
pnpm install

# Levantar Postgres local
docker compose up -d

cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

pnpm --filter @heaven-pass/api db:migrate
pnpm --filter @heaven-pass/api db:seed

pnpm dev # corre api + mobile en paralelo via turbo
```

La API queda en `http://localhost:3000`, la app mobile abre el QR de Expo (`pnpm --filter @heaven-pass/mobile ios|android|web`
para un target específico).

Para autenticarte en dev sin flujo de login real, pegá tu email en la pantalla de Perfil:
hace un `POST /auth/dev-token` que crea (o reusa) un usuario y devuelve un JWT — ruta que
solo se monta cuando `NODE_ENV !== "production"` (ver `apps/api/src/routes/auth.dev.ts`).

## Reservas concurrentes: cómo se evita el oversell

Cada `EventSlot` (par evento + tier) tiene `capacity`, `sold` y `reserved`. Crear una reserva
hace un `UPDATE` guardado por SQL crudo dentro de una transacción:

```sql
UPDATE event_slots
SET reserved = reserved + 1
WHERE id = $1 AND (sold + reserved + 1) <= capacity
```

Postgres evalúa el `WHERE` y aplica el lock de fila de forma atómica por statement: si dos
requests compiten por el último lugar, el que commitea primero hace que el `WHERE` del
segundo sea falso — `$executeRaw` devuelve `0` filas afectadas y ese es el signal para
abortar con 409 en lugar de sobrevender. El mismo patrón protege `accessesUsed <=
accessesTotal` en `Membership`. Ver `apps/api/src/services/reservation.service.ts`.

Una reserva nace en estado `PENDING` con un hold de 15 minutos (`RESERVATION_HOLD_MINUTES`).
Si no se confirma a tiempo, el job de expiración (`apps/api/src/jobs/expire-reservations.job.ts`)
la libera: pasa a `EXPIRED` y decrementa `reserved` del slot y `accessesUsed` de la membresía,
devolviendo el cupo al pool. El job corre en proceso cada `EXPIRATION_JOB_INTERVAL_MS` (dev)
o vía `pnpm --filter @heaven-pass/api jobs:expire-reservations` desde un scheduler externo
(cron / k8s CronJob) en producción.

## Rutas principales

- `GET /events`, `GET /events/:idOrSlug`
- `GET /memberships`, `POST /memberships`
- `GET /reservations`, `POST /reservations`, `POST /reservations/:id/confirm`,
  `POST /reservations/:id/cancel`, `POST /reservations/:id/extras`, `POST /reservations/:id/checkin`
- `POST /webhooks/payments`

## Comandos útiles

```bash
pnpm dev             # api + mobile en paralelo
pnpm build            # build de todos los packages/apps
pnpm typecheck         # tsc --noEmit en todo el monorepo
pnpm test              # tests de cada paquete
pnpm db:studio         # Prisma Studio
```
