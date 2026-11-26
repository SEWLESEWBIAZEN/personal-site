# Personal Engineering Studio

Sewlesew Biazen's portfolio, technical journal and ideas notebook. It runs on Next.js with a PostgreSQL database, and all content is managed from a private admin area at `/admin`.

## Stack

Next.js 15 (App Router, Server Components, Server Actions), TypeScript, PostgreSQL with Prisma, Auth.js v5 (credentials login, JWT sessions), the Tiptap editor, Tailwind plus the original custom CSS, Motion, Lucide, React Hook Form, Zod and Sonner.

## Local setup

You need Node.js 20+, pnpm 10 (`corepack enable`), and either Docker or a local PostgreSQL 15+.

```bash
pnpm install
cp .env.example .env            # fill in AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up db -d         # PostgreSQL only; DB_PORT=5433 if 5432 is taken
pnpm db:deploy                  # apply prisma/migrations
pnpm db:seed                    # admin user, settings, categories, tags, sample content
pnpm dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

If you start the database with `DB_PORT=5433`, change `DATABASE_URL` in `.env` to match. The database name created by Compose is `personal_studio`.

There is no public registration. The seed creates the admin user the first time it runs. Running it again never overwrites an existing admin's password, so change passwords in the database or remove the user and seed again.

## Environment variables

| Variable | When | Notes |
|---|---|---|
| `DATABASE_URL` | always | PostgreSQL connection string |
| `AUTH_SECRET` | always | `openssl rand -base64 32`. Unique per environment; never commit it |
| `AUTH_URL` | production | Public base URL. Also used for canonical URLs, the sitemap, robots and Open Graph |
| `AUTH_TRUST_HOST` | behind a proxy / Docker | `true` so Auth.js trusts the forwarded host |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seeding | Admin account the seed creates if missing (password min. 8 chars) |
| `SEED_SAMPLE_CONTENT` | seeding | `false` skips the sample projects, articles and Now items |
| `STORAGE_PROVIDER` | optional | `local` (default) or `s3` |
| `STORAGE_LOCAL_PATH` | local storage | Default `./uploads` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | `s3` storage | Any S3-compatible service: AWS S3, Cloudflare R2, MinIO, or Bunny Storage via its S3 API |
| `S3_PUBLIC_URL` | `s3` storage | Public base URL that serves the bucket (CDN / pull zone) |

`.env` is git-ignored. `.env.example` holds placeholders only.

## Project layout

```
prisma/                schema, SQL migrations, seed
src/app/(public)/      home, projects, journal, ideas, about, now (all data from the DB)
src/app/admin/         login, dashboard, CRUD screens, media library, settings
src/app/api/           Auth.js handlers, upload + local file serving
src/server/repositories/   read queries (public queries only ever return visible content)
src/server/actions/        Server Actions: every mutation calls requireAdmin() first
src/server/services/       slugs, rich-content preparation, safe media deletion
src/schemas/           Zod schemas shared by forms and actions
src/lib/               prisma client, auth, storage providers, sanitizing, highlighting
src/components/        layout, home sections, journal/project/idea UI, admin forms, editor
```

## Content and security rules

- Projects and journal articles are public only when `PUBLISHED`. Drafts and archived items return 404 and are left out of listings and the sitemap.
- Ideas are separate from the journal. They are public only when `isPublic` is set and the status is not `ARCHIVED`. New ideas are private by default.
- Auth checks happen on the server, in three places:
  - Middleware gates `/admin`.
  - Every Server Action calls `requireAdmin()`.
  - The upload route checks the session and the request origin.
- Server Actions have Next.js's built-in origin check. Auth.js handles CSRF for login.
- Login is rate limited to 5 failures per IP and email, and 20 per IP, within 15 minutes. The limit is enforced inside the credentials provider, so it also covers direct calls to the Auth.js endpoint.
- Passwords are hashed with bcrypt. Sessions are 8-hour JWTs. Password hashes never reach the client.
- `/admin` responses are sent with `Cache-Control: private, no-store` and `noindex`.
- Article and idea bodies are stored as Tiptap JSON plus HTML.
  - The editor sends plain JSON (`toPlainJson`): ProseMirror's `attrs` objects have a null prototype, which Server Actions cannot serialize. Before this was handled, every image, heading, link, code block, table or video was lost in transit and the save failed with HTTP 500.
  - The server validates the document with a recursive schema (`src/lib/rich-text.ts`). Image sources must be uploaded media that exists in the library, or https URLs. `blob:` and `data:` sources are rejected.
  - Records that only have HTML (seeded or imported) open in the editor from their HTML.
  - The HTML is sanitized with `sanitize-html` before it is saved.
  - Iframes are allowed only from YouTube (nocookie) and Vimeo.
  - Code blocks are highlighted on the server.
- Uploads are checked for extension allowlist, declared MIME type, magic bytes and per-type size limits.
  - SVG and HTML are rejected.
  - Files are stored on disk or in S3, never in PostgreSQL.
  - Locally served files get `nosniff` and a sandbox CSP.
- Media still referenced by a project, article, idea or the settings cannot be deleted.
- Media lifecycle: removing an image from an article leaves the file in the media library. Delete it from `/admin/media` once nothing uses it.
- If the database insert fails after an upload, the stored file is deleted again.
- Journal and idea saves return `{ ok, error, code, requestId }` instead of throwing, so the editor shows an actionable message with a reference id.
- Updates send the version they were loaded from. A save from a stale tab, or a retried request, is rejected instead of overwriting newer content.
- Saves and uploads write JSON log lines (`action.*`, `upload.*`) with a request id. Logs never contain document content.

## Tests

| Command | What it runs |
|---|---|
| `pnpm test` | Vitest unit and integration tests. Set `TEST_DATABASE_URL` to a throwaway PostgreSQL database whose name contains `test`. Integration tests use real PostgreSQL and real local disk storage; without the variable they are skipped. |
| `pnpm test:e2e` | Playwright tests against the production build (`pnpm build` first). They use `E2E_DATABASE_URL`, default `postgresql://postgres:postgres@localhost:5432/personal_studio_e2e`, apply migrations and the seed, and drive real uploads. |

The S3 provider is not covered by the tests. They use the local storage provider.

## Project case studies

Projects have optional `role`, `objectives`, `outcomes` and `stage` fields (migration `20261125000000_project_case_study`, additive only).
- The public page shows the case-study sections in a fixed order and hides empty ones.
- The admin form lists the sections that are still missing, so gaps get filled with real information rather than guesses.
- `stage` (concept → production) is shown publicly, so prototypes are never presented as production systems.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm typecheck` / `pnpm lint` | TypeScript and ESLint |
| `pnpm db:migrate` | Create a new migration after editing `schema.prisma` (development) |
| `pnpm db:deploy` | Apply committed migrations (CI / production) |
| `pnpm db:seed` | Seed (idempotent) |
| `pnpm db:studio` | Prisma Studio |

Schema changes always go through `prisma migrate dev`, which produces a SQL migration you commit. Don't use `prisma db push` against shared or production databases.

## Deployment

### Docker Compose

```bash
export AUTH_SECRET="$(openssl rand -base64 32)"
export AUTH_URL="https://your-domain.example"
export ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-long-password"
export POSTGRES_PASSWORD="a-strong-db-password"

docker compose --profile app run --rm migrate   # migrate deploy + seed
docker compose --profile app up -d app
```

The `migrate` image runs `prisma migrate deploy` and then the seed. Uploaded files are kept in the `uploads` volume. Put a TLS-terminating reverse proxy (Caddy, nginx, a platform load balancer) in front of port 3000.

### Without Docker

Set the env vars, then run:

```bash
pnpm install --frozen-lockfile
pnpm db:deploy && pnpm db:seed
pnpm build && pnpm start
```

`next build` does not need a database, because public pages are rendered at request time.

## Known limitations

- The login rate limiter is in memory, so it only covers a single instance. Use Redis or similar if you scale out. It keys on `X-Forwarded-For`, so run the app behind a proxy that sets that header and that clients cannot spoof.
- Public pages are rendered per request (`force-dynamic`) and refreshed with `revalidatePath` after edits, rather than prerendered with ISR. Put a CDN in front if traffic grows.
- The S3 provider is written against the AWS SDK. It has not been run against a real bucket in this repo's tests.
- Prisma 6 warns that the `package.json#prisma` seed config is deprecated. Move it to `prisma.config.ts` when upgrading to Prisma 7.
