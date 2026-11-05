# Street Food Rey — website

Next.js 15 (App Router) · Tailwind CSS · Framer Motion · Supabase. Greek (`/el`, default) and English (`/en`).

## Run

```bash
npm install
cp .env.example .env.local   # fill in values (optional for local dev)
npm run dev                  # http://localhost:3000
```

Without Supabase env vars the site runs in **demo mode**: reviews and form submissions use an in-memory store that resets on restart.

## Where to edit things

| What | File |
| --- | --- |
| **Menu, prices, sizes, sauces, allergens, photos** | `data/menu.json` |
| Locations, addresses, opening hours, summer season dates | `data/locations.json` |
| All Greek / English text | `lib/dictionaries/el.ts`, `lib/dictionaries/en.ts` |
| Phone, social links, delivery fee, catering video, GTM ID | `lib/site.ts` |
| Hero burger layers (illustrated SVG, can swap for PNG cut-outs) | `components/home/BurgerLayers.tsx` |
| Colours / fonts | `tailwind.config.ts`, `app/[lang]/layout.tsx` |

### Menu JSON
- Every text field is `{ "el": "...", "en": "..." }`. Prices in EUR.
- `price` is the item's base price. `options` lists option groups from `optionGroups` (size, cooking, add-ons, sauces…). Each choice's `price` is added on top; `default: true` pre-selects it; `required: true` forces a choice.
- `remove` is a list of free "No …" choices (e.g. No onions).
- `signature: true` puts the item in the home-page carousel; `badge` adds a label.
- **Allergens are empty** — fill `allergens` per item. Keys: `gluten, milk, egg, mustard, sesame, soy, nuts, peanuts, celery, fish, sulphites`. Dietary keys: `vegetarian, vegan, spicy, glutenFreeOption`.

### Photos
All photos are Unsplash placeholders referenced by URL in the JSON files and a few pages (`app/[lang]/page.tsx`, `catering`, `about`). Replace with your own (put files in `public/images/` and use `/images/…`). Any image that fails to load shows a branded fallback.

## Supabase (reviews, enquiries, applications, orders)
1. Create a project, open the SQL editor and run `supabase/schema.sql`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to the browser).
3. Set `ADMIN_PASSWORD`, then visit `/el/admin` to hide/unhide reviews.

Spam protection on public forms: hidden honeypot field, minimum time-to-submit, link/keyword filter, and a limit of 3 reviews per IP per hour (IPs are stored only as salted hashes — set `REVIEW_IP_SALT`).

## Ordering / payment
The cart and checkout (delivery / takeaway, location, details) are complete. **Payment is a placeholder step**: orders are POSTed to `/api/forms/order` and saved in the `orders` table. Plug a provider (JCC, Viva Wallet, Stripe…) into `components/Checkout.tsx` step 3.

## SEO
Per-page titles/descriptions with `hreflang` alternates, dynamic OG image (`app/[lang]/opengraph-image.tsx`), `Restaurant` JSON-LD for each location (+ `AggregateRating` on the reviews page), `sitemap.xml`, `robots.txt`. Google Tag Manager `GTM-PRJTLQX` is loaded in `app/[lang]/layout.tsx`. Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## Accessibility & motion
`prefers-reduced-motion` is respected everywhere (Framer `MotionConfig reducedMotion="user"`, CSS fallbacks). With reduced motion the hero shows the finished burger with no scroll effect.
