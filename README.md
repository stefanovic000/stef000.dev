# stef000.dev

My personal site — portfolio, CV and writing. Static HTML generated from Markdown, served by Caddy on a VPS.

```bash
npm install
npm run build     # writes dist/
npm run serve     # http://127.0.0.1:8080
```

## Layout

| Path | What it does |
|---|---|
| `site.config.mjs` | Name, role, links, projects, skills — everything editable lives here |
| `content/posts/*.md` | Articles (front matter: title, date, tag, tags, excerpt) |
| `content/cv.md` | The CV page, rendered at `/cv` |
| `content/images/` | Images used by posts; drop `portrait.jpg` here to replace the drawn hero |
| `src/templates.mjs` | Page markup |
| `src/assets/style.css` | All styling, dark + light themes |
| `build.mjs` | Markdown → HTML, feed, sitemap, search index |
| `serve.mjs` | Local preview server |

## Notes

- No framework, no bundler. `markdown-it` for rendering, `highlight.js` for code blocks.
- Article images are wrapped in links and open in a lightbox with zoom + pan.
- `HERO=split npm run build` builds the old two-tone hero instead of the single one.
- Deployment is a GitHub Actions build followed by `rsync` of `dist/` to the server.
