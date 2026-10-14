# Frontend (Next.js)

Canonical UI for AirQ Predict.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Environment

- `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:5000`)

API calls are proxied through Next rewrites from `/api/*` to the Flask backend.

## Accessibility and UX notes

- Search form has labels and busy/disabled semantics.
- Loading and errors expose `role=status` / `role=alert` feedback.
- Empty-state suggestions and metro cards are keyboard-accessible buttons.
- Chart sections include textual summaries and labels.
- Reduced-motion users are respected via `prefers-reduced-motion`.

## SEO

- Metadata configured in `src/app/layout.tsx`
- Robots and sitemap routes:
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`
