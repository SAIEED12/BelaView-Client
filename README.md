# BelaView Client

Storefront and admin dashboard for BelaView, a Bangladesh-based home and lifestyle store.
Built with Next.js 16 (App Router), React 19, HeroUI, and Tailwind CSS 4.

<img width="1902" height="926" alt="image" src="https://github.com/user-attachments/assets/bf1dd3c5-8713-481c-9f89-0098e0c67ed7" />
<img width="1903" height="929" alt="image" src="https://github.com/user-attachments/assets/f3c1dee1-cad4-4e72-bd05-3c72d192229a" />
<img width="1901" height="930" alt="image" src="https://github.com/user-attachments/assets/680d4dc6-1e9b-4c41-be31-5e878e35201a" />
<img width="1900" height="927" alt="image" src="https://github.com/user-attachments/assets/fcda86ea-74e6-4dd2-97c9-98533bc3cba3" />
<img width="1907" height="926" alt="image" src="https://github.com/user-attachments/assets/59aa79eb-13fc-4891-bfde-a9af7d17e160" />
<img width="1902" height="927" alt="image" src="https://github.com/user-attachments/assets/0f26ce67-8a7f-4af5-9fdc-eb499fff3bcb" />
<img width="1916" height="922" alt="image" src="https://github.com/user-attachments/assets/c38d801d-f89f-4828-97ae-610854feb78c" />
<img width="1902" height="928" alt="image" src="https://github.com/user-attachments/assets/bb4109e2-731b-40c1-a7d2-ead98cc9805e" />
<img width="1917" height="926" alt="image" src="https://github.com/user-attachments/assets/fb6ce47e-a0e0-4e17-8d84-1f047619d44c" />
<img width="1902" height="927" alt="image" src="https://github.com/user-attachments/assets/3e857888-3cd2-48ef-8f15-cf651b956442" />
<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/e57ec059-82b6-4db7-8c33-81e4a0361e5a" />

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
