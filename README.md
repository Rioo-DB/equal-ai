# Equal AI — landing page

Pixel-accurate build of the Figma frame
[`equal ai website` → node 2105:41](https://www.figma.com/design/fItrV1s1J88U4HGfmKeWit/equal-ai-website--Copy-?node-id=2105-41).

Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.
Fully static — no API routes, server actions, middleware or dynamic APIs.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & check

```bash
npm run lint       # ESLint
npm run build      # webpack build; every route must show as ○ (Static)
npm run start      # serve the production build on :3000
```

## Where to edit things

| What | Where |
|---|---|
| All copy, stats, links, alt text | `src/lib/content.ts` — nothing is hardcoded in components |
| Design tokens (colors) | `src/app/globals.css` → `@theme` |
| Fonts (Manrope, Plus Jakarta Sans via `next/font/google`) | `src/app/layout.tsx` |
| Page metadata / Open Graph / theme color | `src/app/layout.tsx` |
| Favicon | `src/app/icon.png` (cropped from the logo mark) |
| Images & SVGs | `public/assets/` |
| Sections | `src/components/*.tsx` + matching `*.module.css` |

### Before launch (TODOs)

- Every link in `content.ts` points to `#` — replace with real URLs.
- The stats (`1M+`, `25M+`, `4.8`) are marked `// TODO: verify before launch`.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain (used for absolute OG URLs).
- The logo source is 71×21 px (from the Figma file); swap in a larger PNG/SVG if you have one.

## Layout model

The design is 1440 px wide. `--u` (defined in `globals.css`) is one design pixel:
exactly `1px` at ≥1440, shrinking proportionally between 1024 and 1439
(the page wrapper is a size container, so `100cqw == min(viewport, 1440px)`).
Below 1024 px every component switches to its own stacked layout and `--u`
falls back to `1px`.

## Deployment

### Option A — Vercel (default)

Uses `next/image` optimization out of the box.

```bash
npx vercel          # preview deployment
npx vercel --prod   # production (only after the preview is approved)
```

### Option B — pure static hosting (S3, Netlify, cPanel, …)

Next.js does not optimize images in export mode, so pre-compress them first:

1. `npm run optimize-images` — writes WebP versions of every PNG in
   `public/assets/` (2880 px max width, quality 90).
2. In `src/lib/content.ts` set `IMAGE_FORMAT` to `"webp"`.
3. In `next.config.ts` uncomment:
   ```ts
   output: 'export',
   images: { unoptimized: true },
   trailingSlash: true,
   ```
4. `npm run build` → upload the `out/` folder.

## Optional: lead form

If "Get Started" becomes a waitlist/contact form, add a single Route Handler at
`src/app/api/lead/route.ts` (validated with zod, basic rate limiting). It runs as
a serverless function on Vercel. Not built yet.

## Scroll videos

The two scroll-driven sequences are folders of WebP frames in `public/assets`
(`phones-frames`, `demo-frames`), and the demo continues as
`public/assets/demo-watch.mp4` (with sound) once the phone is tapped. They are
built from source videos that are not in git; put them in `media/` and run
`npm run extract-frames` / `npm run extract-demo-frames` to rebuild:

| Source | Used for |
|---|---|
| `media/phones-features.mp4` | the feature phones (`phones-frames`) |
| `media/product-demo.mp4` | the demo up to "Click here to watch" (`demo-frames`) |
| `media/product-demo-v5.mp4` | `demo-watch.mp4` (command in `scripts/extract-demo-frames.mjs`) |
