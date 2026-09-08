# Cloudflare + SEO ops notes (KeydTech)

## Findings from Sep 2026 analytics

- Cloudflare celebrated **100k+ pageviews** on keydtech.com; strong UK + Somalia traffic.
- HTTP traffic showed **~99% uncached** requests — CDN was mostly proxying, not caching.
- Google Search Console milestone: **15 clicks / 28 days** — organic search is early; bilingual blog + sitemap should help.
- **129 attacks blocked** — keep admin behind Auth.js, rate-limit login, never expose write APIs publicly.

## Recommended Cloudflare Cache Rules

1. Rule name: `Next static assets`
   - If URI Path starts with `/_next/static`
   - Then: Cache eligibility = Eligible for cache, Edge TTL = 1 month
2. Rule name: `Public images`
   - If URI Path starts with `/images` OR file extension in `png,jpg,webp,svg,ico`
   - Then: Eligible for cache, Edge TTL = 1 week
3. Bypass cache for `/admin*` and `/api/auth*`

## SEO follow-ups

- Submit `https://keydtech.com/sitemap.xml` in Google Search Console
- Publish 1–2 bilingual posts per week (EN + SO) targeting "Odoo ERP Somalia", "POS Mogadishu", etc.
- Ensure Search Console property is on `keydtech.com` (and www redirect if used)
