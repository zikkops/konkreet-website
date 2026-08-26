# Konkreet

A Next.js replica of <http://konkreet.vipmindslb.com/> (originally WordPress + Elementor),
rebuilt as a static single-page site with all images served locally.

## Running

```bash
npm run dev     # http://localhost:3000
npm run build   # static prerender
npm start
```

## Structure

| Path | What it holds |
| --- | --- |
| [src/app/layout.tsx](src/app/layout.tsx) | Root layout, Raleway via `next/font`, metadata |
| [src/app/globals.css](src/app/globals.css) | Design tokens + `display` / `eyebrow` / `rule` utilities |
| [src/app/page.tsx](src/app/page.tsx) | Section composition and profile grouping |
| [src/components/](src/components/) | One component per section of the page |
| [src/data/content.ts](src/data/content.ts) | All copy, image paths and project data, extracted from the source markup |
| [public/images/](public/images/) | Site imagery: `projects/<slug>/` holds Mario’s supplied photos, the rest came from the original |

## Design tokens

Taken verbatim from the Elementor kit's `:root` block:

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary` | `rgba(23, 73, 81, 0.96)` | Headings, dark section backgrounds |
| `--color-copper` | `#c77f4f` | Eyebrow labels, rules, accent borders, primary button |
| `--color-cream` | `#dbd9cb` | Projects band, contact panel |
| `--color-ink` | `#14282b` | Body text, solid project bars |
| `--color-page` | `#f4f2ea` | Page background |
| `--color-on-dark` | `#ffffffd1` | Body text on teal |

Layout constants also come from the source: `76px` content gutter, `96px` on the
header / closing / footer bands, `120px` vertical section padding. All three are
`clamp()`-ed so the desktop values are exact at ≥1024px and shrink on small screens.

## Fidelity

Verified by screenshotting both sites at 1440px and comparing section by section.
Total page height: original **31746px**, replica **31980px** (0.7%).
Measured element geometry matches the original exactly for the method heading
(1288px), expertise grid (629px), project profile headings (525px) and the
about heading (624×177px).

Two source behaviours worth knowing, because they are easy to "fix" by accident:

- **Heading weights.** The source wraps heading text in `<strong>` inside elements
  that already declare a weight, so the browser steps each one up — the hero
  headline renders at 900 (not the declared 700), and every `<strong>`-wrapped
  label renders at 700. Those effective weights are what this build uses.
- **Container padding.** The hero's left column and both About columns keep
  Elementor's default 10px container padding, which is what narrows the hero
  headline to five lines. Other columns set `padding: 0` explicitly.

## Deliberate differences from the original

- **Email field.** The source's contact panel labels a row "Email" but prints the
  phone number as its text, while the underlying link points at
  `info@konkreet.co`. This build shows `info@konkreet.co`.
- **Navigation links.** The source's menu items and hero buttons have empty
  `href`s and do nothing. Here they are wired to in-page anchors, and the mobile
  breakpoint gets a working hamburger menu (the source only stacks columns).
- **Two projects added from the handover.** BRGRCo and Downtown Apartment had
  photo folders but no entry on the original site. Their titles come from the
  folder names; **role, project type and description are placeholder copy
  written in the site’s voice and need confirming.** Both sit in the Completed
  group.
- **Al Wadi Hills Apartment** was a plain dark text bar under Additional Project
  Experience and is now a full image card. Only its cover is used — the other
  four supplied photos have nowhere to go unless it also gets a profile section.
- **Duplicate project block.** The source contains two consecutive profiles
  labelled "Project 17" and "Project 16", both titled *Tilal El Aasal -
  Kfardebian 6879*, sharing the same ten photos and the same metadata but with
  different descriptions. Both are reproduced as-is, including the out-of-order
  numbering. Removing one is a content decision, not a build decision.
- **Type scaling.** The source keeps desktop font sizes at mobile widths, which
  overflows. Headings here use `clamp()` so desktop is unchanged and small
  screens stay readable.

## Project photography

Project images live in [public/images/projects/](public/images/projects/), one
folder per project. They were processed from the 1.2 GB of originals Mario
supplied: EXIF-rotated, resized to fit 1600px, encoded as WebP at quality 80
(1.2 GB → 28 MB, averaging 188 KB per file). Within each folder `cover.webp` is
the project card image and `01..11.webp` fill the gallery, in the order the
source files were named (`Cover`, then `Pic 1`, `Pic 2`, …).

Galleries are **capped at 12 images**, the largest the two-column layout was
built for — a 12-image gallery is already ~1294px tall against a ~700px spec
card. Several folders supplied more: Faqra Club 371 (40), Faqra 9330 (25),
Abd El Wahab (20), Iglu / Tilal El Aasal 13626 / 6879 / 9927 (16 each).
Raising the cap is a one-line change, but the columns get long fast.

Nine projects had no folder in the handover and still use the original site’s
photography: Faqra Club Villa 8011, Dbayeh Apartment, Park Tower Suites Hotel,
Country Lodge Club, Achrafieh Offices, Crepaway, Bayada Apartment, Achrafieh
Restaurant and Val De Neige.

## Known content errors inherited from the original

Wrong on the live site, reproduced verbatim rather than invented over. These
need Mario’s copy to fix:

- The Dbayeh loft description — *“A loft project in Dbayeh Waterfront requiring
  execution management…”* — is duplicated onto five unrelated projects:
  Achrafieh Offices, Val De Neige, Tilal El Aasal 6879, Iglu Restaurant, MAIA.
- **Project Type “Residential Mountain Development”** is applied to five
  restaurants: Crepaway, Achrafieh Restaurant, Iglu, Abd El Wahab, MAIA.
- Iglu, Abd El Wahab and MAIA carry **Role: Management & Contracting** in their
  profile while their project cards say *Execution & Coordination*.

## Regenerating content

`src/data/content.ts` was generated from the original markup rather than
hand-transcribed. It is checked in and safe to edit directly; there is no build
step that overwrites it.
