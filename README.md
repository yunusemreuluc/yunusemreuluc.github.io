# Yunus Emre Uluç — The Series

The resume of a Junior AI Engineer, told as a TV series: the summary is the pilot, every resume section is a
season and every entry is an episode — in the resume's own order, in Turkish and English.

**Live:** https://yunusemreuluc.github.io · `?lang=en` / `?lang=tr` picks the language.

| Season | Resume section |
| --- | --- |
| Pilot | Summary |
| 1 | AI Projects — Airon, Workflow Automation, FractureAI, Dengue Fever Detection |
| 2 | Experience — Opak Yazılım |
| 3 | Skills |
| 4 | Education |
| 5 | Certifications and Languages |

**Play all episodes** runs the whole resume binge-style, with an up-next countdown
(Space pauses, ← → change episode, Esc closes).

## Run

```bash
npm install
npm run dev      # local
npm run deploy   # build and publish dist/ to the gh-pages branch
```

React 18 + TypeScript + Vite, plain CSS, no UI or animation libraries.

## Content

All text lives in `src/content/en.ts` and `src/content/tr.ts` (same shape, typed by `src/content/types.ts`).
To use this for your own resume, replace those two files, `public/yunus.jpg`, `public/og.jpg` and the PDF.

## License

Code: [MIT](LICENSE). The resume, photos and texts in `src/content/` are © Yunus Emre Uluç, all rights reserved — see [CONTENT-NOTICE.md](CONTENT-NOTICE.md).
