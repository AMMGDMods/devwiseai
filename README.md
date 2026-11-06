# DevWiseAI

An English blog about AI tools for developers, programming tutorials and software reviews.
Built with [Astro](https://astro.build) as a fully static site, deployed on Vercel.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Writing a post

Add a Markdown file to `src/content/blog/`. The file name becomes the URL (`/blog/<file-name>/`).

```yaml
---
title: "Post title"
description: "One or two sentences, under 170 characters (used as the meta description)."
pubDate: 2026-11-06
category: ai-tools        # ai-tools | tutorials | reviews | dev-productivity
tags: ["tag one", "tag two"]
author: "Amgd Al-Subaihi"
draft: false
---
```

## Switching to the custom domain

1. In `src/consts.ts`, change `SITE_URL` to `https://devwiseai.com`.
2. Commit and push. Canonical URLs, Open Graph, the sitemap, RSS and robots.txt all follow.

## Google AdSense

- The AdSense loader script is in `src/layouts/BaseLayout.astro`, commented out.
  Uncomment it and insert the real publisher ID after approval.
- Ad unit placeholders live in `src/components/AdSlot.astro` (disabled by `ADS_ENABLED = false`).
- `ads.txt.example` shows the ads.txt line; copy it to `public/ads.txt` with the real ID.

## SEO

- Per-page title, meta description, canonical URL, Open Graph and Twitter tags (`BaseLayout.astro`)
- JSON-LD: `WebSite` + `Organization` on the home page, `Article` + `BreadcrumbList` on posts
- `/sitemap-index.xml` (via `@astrojs/sitemap`), `/robots.txt`, `/rss.xml`
