# KeydTech

Premier Odoo ERP website for KeydTech (Mogadishu) — Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, `next-intl` (EN/SO), bilingual blog, and a secure admin CMS.

## Quick start

```bash
cp .env.example .env.local
# fill DATABASE_URL, AUTH_SECRET, admin bootstrap, optional BLOB token
npm install
npm run db:push
npm run db:seed
npm run dev
```

- Public site: [http://localhost:3000/en](http://localhost:3000/en)
- Blog: [http://localhost:3000/en/blog](http://localhost:3000/en/blog)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (`https://keydtech.com`) |
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` | Seeded Super Admin |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads for cover images |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp digits |

## Roles

- **SUPER_ADMIN** — users, categories, all posts, publish
- **EDITOR** — categories, all posts, publish
- **AUTHOR** — own posts as drafts (editors publish)

## Cloudflare checklist (performance)

Your analytics showed **very low cache hit ratio**. In Cloudflare (Free):

1. **Caching → Cache Rules** — Cache everything matching `/_next/static/*` (Edge TTL: 1 month)
2. Cache static images under `/images/*` and favicons
3. Keep SSL/TLS on **Full (strict)**
4. Review bot traffic (UK spikes) under Security → Bots if needed

## Vercel deploy

1. Create a Neon project and copy `DATABASE_URL`
2. Set all env vars in Vercel Project Settings
3. Create a Blob store and set `BLOB_READ_WRITE_TOKEN`
4. Deploy — `postinstall` runs `prisma generate`
5. Run once: `npx prisma db push` and `npm run db:seed` (local against prod URL, or Neon SQL editor + seed from CI)

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run db:push` — sync Prisma schema to Neon
- `npm run db:seed` — admin + categories + sample post
- `npm run db:studio` — Prisma Studio
