# BelaView Client

Storefront and admin dashboard for BelaView, a Bangladesh-based home and lifestyle store.
Built with Next.js 16 (App Router), React 19, HeroUI, and Tailwind CSS 4.

## Features

- Product catalog with search, category filters, price filtering, sorting, and pagination
- Product pages with image gallery, size selection, and customer reviews
- Cart drawer, buy-now checkout, and cash-on-delivery orders
- Customer accounts with order history and wishlist
- Admin dashboard for products, categories, orders, reviews, and customers
- Meta Pixel and Conversions API tracking

## Tech stack

- **Framework:** Next.js 16 (App Router, JavaScript)
- **UI:** React 19, HeroUI, Tailwind CSS 4, lucide-react, Swiper
- **Auth:** Better Auth with the JWT plugin
- **Database:** MySQL via Drizzle ORM
- **Charts:** Recharts

## Getting started

Requires Node.js 20.9+ and a MySQL database.

```bash
npm install
npm run dev
```

Create a `.env` file in the project root:

```dotenv
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-32-character-secret
SERVER_URL=https://api.example.com

DB_HOST=localhost
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=belaview_database

NEXT_PUBLIC_META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
```

Open [http://localhost:3000](http://localhost:3000).

The app expects these MySQL tables to already exist: `user`, `session`, `account`,
`verification`, `jwks`, and `carts`. No migrations are bundled.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run pack:cpanel` | Package the standalone build for cPanel |

## Project structure

```text
app/          Routes, API handlers, and pages
components/   UI grouped by domain
lib/          Auth, database, server actions, and helpers
public/       Static assets
proxy.js      Route guards and redirects
scripts/      cPanel packaging script
```

## License

Private project. All rights reserved.
