# Belaview client — cPanel deployment

This client is a prebuilt Next.js standalone app. Do **not** run `npm install`,
`npm run build`, or `next start` on cPanel. The zip already contains the server,
the traced `node_modules`, `.next`, and `public`.

## Artifact

| | |
| --- | --- |
| File | `belaview-client-cpanel.zip` |
| Size | 35,093,113 bytes (33.5 MB) |
| SHA256 | `8F03C7CD0984BF8A6D42C02EB07EA47AE170CD9CF1C5CFECE43A14FF4F15DA05` |
| Startup file | `server.js` |
| Node version | 24 (production mode) |

Rebuild it with:

```powershell
npm run pack:cpanel
```

The pack script builds the standalone output, copies `public` and
`.next/static`, removes `.env`, rejects Windows native binaries, and writes the
zip at the project root.

## 1. Database

Run `database/carts.sql` from the server project in
**cPanel → phpMyAdmin → belaview_database → SQL**. The full
`database/schema.sql` already contains the same table.

The client writes only the Better Auth tables, `carts`, and reads `user`.
The API owns products, categories, orders, and wishlists.

## 2. Create the cPanel Node.js app

**cPanel → Setup Node.js App → Create Application**

- Node.js version: **24**
- Application mode: **Production**
- Application root: `belaviewbd.com`
- Application URL: `belaviewbd.com`
- Application startup file: `server.js`
- Do **not** set `PORT`; cPanel/Passenger supplies it.

Upload `belaview-client-cpanel.zip` into the application root, extract it
(enable **Settings → Show Hidden Files** in File Manager so `.next` is visible),
and confirm these are directly inside the app root:

```text
server.js
package.json
next.config.mjs
node_modules/
.next/
public/
```

There must be **no** `.env` file in the app root.

## 3. Environment variables

Add these in **Setup Node.js App → Environment Variables**:

```text
NODE_ENV=production
BETTER_AUTH_URL=https://belaviewbd.com
BETTER_AUTH_SECRET=<the existing 32+ character secret; keep it stable>
SERVER_URL=https://api.belaviewbd.com
DB_HOST=localhost
DB_USER=belaview_db
DB_PASSWORD=<cPanel database password>
DB_NAME=belaview_database
HOSTNAME=0.0.0.0
NEXT_PUBLIC_META_PIXEL_ID=2332344227519511
META_CAPI_ACCESS_TOKEN=<Meta CAPI token>
```

Notes:

- `HOSTNAME=0.0.0.0` is important. Without it Next may try to bind to the
  server hostname instead of the address Passenger connects to.
- `BETTER_AUTH_URL` must be the exact public origin, with no trailing slash.
- Keep `BETTER_AUTH_SECRET` unchanged after the first JWT key is created. The
  private JWKS key is encrypted with it.
- `NEXT_PUBLIC_META_PIXEL_ID` is baked into the browser bundle at build time.
  Changing it in cPanel does not change the already-built bundle.
- Do not add `MONGODB_URI`, `NEXT_PUBLIC_IMAGEBB_API_KEY`, or `PORT`.

Restart the app after saving.

## 4. API environment

In the API app (`api.belaviewbd.com`), set and restart:

```text
AUTH_BASE_URL=https://belaviewbd.com
MEDIA_BASE_URL=https://api.belaviewbd.com
```

`AUTH_BASE_URL` must exactly match the client's `BETTER_AUTH_URL`; the API
checks the JWT issuer and audience. `MEDIA_BASE_URL` makes uploaded image URLs
use `https://api.belaviewbd.com/uploads/...` instead of an inferred scheme.

Ensure `public/uploads` exists and is writable under the API app root. The API
creates it on startup.

## 5. Domain

Set the `www.belaviewbd.com` → `belaviewbd.com` redirect in cPanel. The auth
cookie and JWT issuer both use the apex domain.

## 6. First admin and smoke test

1. Open `https://belaviewbd.com/signup` and create the admin account.
2. In phpMyAdmin run:
   ```sql
   UPDATE `user` SET role = 'admin' WHERE email = 'you@example.com';
   ```
3. Sign out and sign in again.
4. Open the admin dashboard → **Seed Categories** if the store is empty.
5. Add a category with an uploaded image. Confirm the saved URL starts with
   `https://api.belaviewbd.com/uploads/`.
6. Add a product with 1–5 images. Confirm the product appears on the storefront.
7. Add an item to the cart, reload the page, and confirm it is still there.
8. Place a COD order as a guest, then check it under admin orders.
9. Check the customer dashboard and wishlist while signed in.
10. Confirm `/api/auth/jwks` returns at least one key after the first token is
    issued.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| 503 / app not starting | cPanel `stderr.log`; `server.js` is the startup file; `HOSTNAME=0.0.0.0`; no `PORT` override |
| Signup 500 / DB error | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`; database user privileges on `carts` |
| Sign-in works but admin routes redirect | Promote `user.role`, then sign out/in so the cookie cache refreshes |
| Upload 401/403 | Signed in as admin; `SERVER_URL`; API app running; JWT key exists |
| Uploaded URL is `http://` | Set API `MEDIA_BASE_URL=https://api.belaviewbd.com` and restart |
| Images 404 | API `public/uploads` exists and the file is present; API zip does not overwrite uploads |
| `Failed to decrypt private key` | `BETTER_AUTH_SECRET` changed; restore the old secret or clear `jwks` before first use |

The old MongoDB/Vercel deployment can remain as a rollback until the cPanel
flow is verified.
