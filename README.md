# KeydTech

Premier Odoo ERP website for KeydTech (Mogadishu, Somalia) — Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, `next-intl` (EN/SO), and a FOUC-safe dark/light theme provider.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/en`).

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, e.g. `25261…` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact email |
| `NEXT_PUBLIC_PHONE_DISPLAY` | Display phone string |
| `NEXT_PUBLIC_ADDRESS` | Business location |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## Structure

- `src/app/[locale]` — localized routes (Home, Solutions, Pricing, About, Contact)
- `src/messages` — English & Somali copy
- `src/components` — layout, home sections, contact form, SEO
- `public/images/keydtech-logo.png` — brand logo
# keytech
