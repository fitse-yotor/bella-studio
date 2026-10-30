# Vercel deployment

This repository supports two build targets. Sites/Cloudflare uses `npm run build`
and produces `dist/`. Vercel uses `npm run build:vercel` and produces `.next/`.
`vercel.json` selects the correct command and output automatically.

In Vercel, select the repository directory containing package.json as the Root
Directory, use the Next.js framework preset, and deploy the updated source.
Remove any conflicting dashboard overrides for Build Command or Output Directory.
Use Node.js 22.x (at least 22.13).

## Training registration

Cloudflare's native D1 binding is not available in a Vercel function. The Next.js
build uses a server-only D1 REST adapter. Configure these Vercel environment
variables for each deployment environment that accepts applications:

- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_D1_DATABASE_ID
- CLOUDFLARE_D1_API_TOKEN (account-scoped D1 edit permission)

Point these at a D1 database with the schema in drizzle/0000_good_elektra.sql.
The existing Sites database has that migration already; do not replay it there.
For a newly created database, apply the migration once before accepting applications.
Sites-managed database credentials may not be available in your Cloudflare account;
in that case configure your own D1 database. Existing applications are not migrated
automatically. Never put credentials in NEXT_PUBLIC_ variables or commit them.

Without these settings the website still builds and loads, but registration returns
503 with an honest unavailable message. D1 REST uses Cloudflare's global API rate
limits; it is suitable here for low-volume applications, not a high-traffic data API.

## Local verification

Run `npm run build:vercel`, then `npm run start:vercel -- --port 3000`.
The successful build must contain `.next/routes-manifest.json` and the `/` and
`/api/training` routes. Cloudflare continues using the original build/start commands.
