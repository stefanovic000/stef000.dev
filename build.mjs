import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import footnote from "markdown-it-footnote";
import hljs from "highlight.js";
import site from "./site.config.mjs";
import * as T from "./src/templates.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "dist");
const CONTENT = path.join(ROOT, "content");

// HERO=split gives the two-tone variant; default is the single dark hero.
site.heroMode = process.env.HERO || "dark";

// Drop a photo at content/images/portrait.jpg (or .png) and it replaces the drawn scene.
site.portrait =
  ["portrait.jpg", "portrait.png", "portrait.jpeg"]
    .map((f) => path.join(CONTENT, "images", f))
    .find((f) => fs.existsSync(f)) ?? null;
site.portrait = site.portrait ? `/assets/images/${path.basename(site.portrait)}` : null;

/* ---------- markdown ---------- */

// Chirpy writes callouts as `> quote` followed by `{: .prompt-tip }`.
// Rewrite that to a marker the renderer understands, so old posts keep working.
function preprocessPrompts(src) {
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = /^\{:\s*\.prompt-(tip|warning|info|danger)\s*\}\s*$/.exec(lines[i].trim());
    if (!m) continue;
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === "") j--;
    if (j < 0 || !lines[j].startsWith(">")) continue;
    let start = j;
    while (start - 1 >= 0 && lines[start - 1].startsWith(">")) start--;
    lines[start] = lines[start].replace(/^>\s?/, `> [!${m[1].toUpperCase()}] `);
    lines.splice(i, 1);
    i--;
  }
  return lines.join("\n");
}

function callouts(md) {
  md.core.ruler.push("callouts", (state) => {
    const toks = state.tokens;
    for (let i = 0; i < toks.length; i++) {
      if (toks[i].type !== "blockquote_open") continue;
      let depth = 0;
      let close = -1;
      for (let j = i + 1; j < toks.length; j++) {
        if (toks[j].type === "blockquote_open") depth++;
        else if (toks[j].type === "blockquote_close") {
          if (depth === 0) { close = j; break; }
          depth--;
        }
      }
      if (close < 0) continue;
      const inline = toks.slice(i + 1, close).find((t) => t.type === "inline");
      if (!inline) continue;
      const m = /^\[!(TIP|WARNING|INFO|DANGER)\]\s*/i.exec(inline.content);
      if (!m) continue;
      inline.content = inline.content.slice(m[0].length);
      if (inline.children?.length && inline.children[0].type === "text") {
        inline.children[0].content = inline.children[0].content.replace(m[0], "");
      }
      toks[i].attrJoin("class", "callout callout-" + m[1].toLowerCase());
    }
  });
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const out = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return `<pre class="hljs"><code class="language-${lang}">${out}</code></pre>`;
      } catch { /* fall through */ }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});
md.use(footnote);
md.use(callouts);

// Wrap body images in a link so they can open the full-screen viewer.
// Without JS the link still opens the image on its own.
const LINKED = /<a\b[^>]*>[\s\S]*?<\/a>/g;
function zoomable(html) {
  const keep = [];
  html = html.replace(LINKED, (m) => {
    keep.push(m);
    return `\u0000${keep.length - 1}\u0000`;
  });
  html = html.replace(/<img\b([^>]*?)\/?>/g, (m, attrs) => {
    const src = /src="([^"]+)"/.exec(attrs)?.[1];
    return src ? `<a class="zoom" href="${src}"><img${attrs}></a>` : m;
  });
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[Number(i)]);
}

// kramdown shows footnote refs as bare numbers, markdown-it shows "[1]".
md.renderer.rules.footnote_ref = (tokens, idx) => {
  const { id, subId } = tokens[idx].meta;
  const n = id + 1;
  const suffix = subId > 0 ? `:${subId}` : "";
  return `<sup class="footnote-ref"><a href="#fn${n}" id="fnref${n}${suffix}" aria-label="Footnote ${n}">${n}</a></sup>`;
};

/* ---------- helpers ---------- */

const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true });
const write = (rel, body) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return rel;
};
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
};
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const excerptOf = (body, fallback = "") => {
  const p = body.split(/\n{2,}/).find((x) => x.trim() && !x.startsWith("#") && !x.startsWith("-") && !x.startsWith(">") && !x.startsWith("```"));
  const text = (p ?? fallback).replace(/[#>*`\[\]\(\)]/g, "").replace(/\s+/g, " ").trim();
  return text.length > 180 ? text.slice(0, 177).trimEnd() + "…" : text;
};

/* ---------- content ---------- */

const postsDir = path.join(CONTENT, "posts");
const posts = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".md"))
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const body = preprocessPrompts(content);
    return {
      title: data.title,
      date: data.date,
      tag: data.tag ?? (Array.isArray(data.categories) ? data.categories[0] : data.categories) ?? "note",
      tags: data.tags ?? (Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : []),
      excerpt: data.excerpt ?? excerptOf(body),
      slug,
      url: `/posts/${slug}/`,
      html: zoomable(md.render(body)),
      readingTime: Math.max(1, Math.round(words(body) / 220))
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

/* ---------- build ---------- */

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

const pages = [];
pages.push(write("index.html", T.layout({ title: `${site.name} — ${site.role}`, description: site.tagline, body: T.home(posts), active: "home" })));
pages.push(write("posts/index.html", T.layout({ title: `Writing — ${site.name}`, description: "Problems worth writing down.", body: T.postsIndex(posts), active: "writing" })));
pages.push(write("projects/index.html", T.layout({ title: `Projects — ${site.name}`, description: "Things I build.", body: T.projectsPage(site.projects), active: "projects" })));
pages.push(write("cv/index.html", T.layout({ title: `CV — ${site.name}`, description: site.role, body: T.cvPage(md.render(preprocessPrompts(fs.readFileSync(path.join(CONTENT, "cv.md"), "utf8")))), active: "cv" })));

for (const p of posts) {
  pages.push(write(`${p.url.slice(1)}index.html`, T.layout({ title: `${p.title} — ${site.name}`, description: p.excerpt, body: T.postPage(p), active: "writing" })));
}

pages.push(write("404.html", T.layout({ title: "404", body: T.notFound() })));

/* assets */
copyDir(path.join(ROOT, "src", "assets"), path.join(OUT, "assets"));
copyDir(path.join(CONTENT, "images"), path.join(OUT, "assets", "images"));
fs.writeFileSync(
  path.join(OUT, "assets", "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1b1b1e"/><text x="32" y="43" font-family="monospace" font-size="30" font-weight="700" fill="#f4f4f1" text-anchor="middle">S</text></svg>`
);

/* search index */
write(
  "assets/search.json",
  JSON.stringify(posts.map((p) => ({ title: p.title, url: p.url, date: p.date, excerpt: p.excerpt, tags: p.tags })), null, 2)
);

/* feed */
const feed = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"><channel>
<title>${site.name}</title>
<link>https://${site.domain}/</link>
<description>${site.tagline}</description>
<language>en</language>
${posts
  .map(
    (p) => `<item><title>${p.title}</title><link>https://${site.domain}${p.url}</link><guid>https://${site.domain}${p.url}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${p.excerpt.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</description></item>`
  )
  .join("\n")}
</channel></rss>`;
write("feed.xml", feed);

/* sitemap + robots */
const urls = ["/", "/posts/", "/projects/", "/cv/", ...posts.map((p) => p.url)];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>https://${site.domain}${u}</loc></url>`).join("\n")}
</urlset>`
);
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /studio/\n\nSitemap: https://${site.domain}/sitemap.xml\n`);

console.log(`built ${pages.length + 4} files → dist/  (${posts.length} post${posts.length === 1 ? "" : "s"})`);
