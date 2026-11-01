import site from "../site.config.mjs";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

const icon = (name) => {  const paths = {
    github:
      '<path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>',
    mail: '<path d="M2 5.5h20v13H2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m2.6 6.3 9.4 7 9.4-7" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    rss: '<path d="M4 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 10a8 8 0 0 1 8 8M4 4a14 14 0 0 1 14 14" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  };
  return `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">${paths[name] ?? ""}</svg>`;
};

// abstract contour lines, generated once at build time
const contours = (() => {
  const rows = [];
  for (let i = 0; i < 20; i++) {
    const y = -30 + i * 54;
    const amp = 9 + (i % 5) * 3.5;
    const period = 360 + (i % 4) * 110;
    const phase = i * 0.62;
    let d = `M-260 ${y.toFixed(1)}`;
    for (let x = -260; x <= 1900; x += 40) {
      const yy = y + Math.sin((x / period) * Math.PI * 2 + phase) * amp;
      d += `L${x} ${yy.toFixed(1)}`;
    }
    rows.push(`<path d="${d}"${i % 3 === 0 ? ' class="p-warm"' : ""}/>`);
  }
  return rows.join("");
})();

const nav = (active) => `<header class="nav">
  <a class="brand" href="/">stef000<span>.dev</span></a>
  <nav class="nav-links">
    <a href="/posts/"${active === "writing" ? ' class="is-active"' : ""}>Writing</a>
    <a href="/projects/"${active === "projects" ? ' class="is-active"' : ""}>Projects</a>
    <a href="/cv/"${active === "cv" ? ' class="is-active"' : ""}>CV</a>
    <a href="mailto:${site.email}">Contact</a>
  </nav>
</header>`;

const footer = () => `
<footer class="footer">
  <div class="footer-inner">
    <p>© ${new Date().getFullYear()} ${esc(site.name)}</p>
    <p class="footer-links">
      <a href="https://github.com/${site.github}">GitHub</a>
      <a href="mailto:${site.email}">Email</a>
      <a href="/feed.xml">RSS</a>
    </p>
  </div>
</footer>`;

export const layout = ({ title, description, body, active }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){var d=document.documentElement;try{var q=new URLSearchParams(location.search).get("theme");var t=q||localStorage.getItem("theme");d.dataset.theme=t==="light"?"light":"dark";}catch(e){d.dataset.theme="dark";}})();</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description ?? site.tagline)}">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="/feed.xml">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description ?? site.tagline)}">
<meta property="og:type" content="website">
</head>
<body>
<div class="ambient" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>
<div class="pattern" aria-hidden="true"><div class="pattern-inner">
  <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${contours}</svg>
</div></div>
${nav(active)}
<main>
${body}
</main>
${footer()}
<div class="lb" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Image viewer">
  <button class="lb-close" type="button" aria-label="Close image">&times;</button>
  <div class="lb-stage">
    <img class="lb-img" alt="" draggable="false">
  </div>
  <div class="lb-tools">
    <button class="lb-btn" type="button" data-zoom="-1" aria-label="Zoom out">&minus;</button>
    <span class="lb-zoom">100%</span>
    <button class="lb-btn" type="button" data-zoom="1" aria-label="Zoom in">+</button>
    <button class="lb-btn lb-reset" type="button" data-zoom="0" aria-label="Reset zoom">Reset</button>
  </div>
  <span class="lb-count"></span>
</div>
<button class="tt" type="button" aria-pressed="false" aria-label="Switch to light theme" title="Toggle theme">
  <svg class="tt-icon" viewBox="0 0 24 24" aria-hidden="true">
    <g class="tt-rays">
      <line x1="12" y1="2.2" x2="12" y2="4.3"/>
      <line x1="12" y1="19.7" x2="12" y2="21.8"/>
      <line x1="2.2" y1="12" x2="4.3" y2="12"/>
      <line x1="19.7" y1="12" x2="21.8" y2="12"/>
      <line x1="5.1" y1="5.1" x2="6.6" y2="6.6"/>
      <line x1="17.4" y1="17.4" x2="18.9" y2="18.9"/>
      <line x1="5.1" y1="18.9" x2="6.6" y2="17.4"/>
      <line x1="17.4" y1="6.6" x2="18.9" y2="5.1"/>
    </g>
    <circle class="tt-core" cx="12" cy="12" r="6.2"/>
    <circle class="tt-cut" cx="15.2" cy="8.4" r="5.6"/>
  </svg>
</button>
<script>
(function () {
  var b = document.querySelector(".tt");
  if (!b) return;
  var d = document.documentElement;
  function sync() {
    var light = d.dataset.theme === "light";
    b.setAttribute("aria-pressed", light ? "true" : "false");
    b.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  }
  sync();
  b.addEventListener("click", function () {
    var next = d.dataset.theme === "light" ? "dark" : "light";
    d.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  });
})();
</script>
<script>
(function () {
  if (!window.matchMedia("(pointer:fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var layers = [
    { el: document.querySelector(".pattern-inner"), k: 1 },
    { el: document.querySelector(".ambient"), k: 0.45 }
  ].filter(function (l) { return l.el; });
  if (!layers.length) return;
  var tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 34;
    ty = (e.clientY / window.innerHeight - 0.5) * 22;
  }, { passive: true });
  (function loop() {
    cx += (tx - cx) * 0.055;
    cy += (ty - cy) * 0.055;
    for (var i = 0; i < layers.length; i++) {
      layers[i].el.style.transform = "translate3d(" + (cx * layers[i].k).toFixed(2) + "px," + (cy * layers[i].k).toFixed(2) + "px,0)";
    }
    requestAnimationFrame(loop);
  })();
})();
</script>
<script>
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll("a.zoom"));
  if (!links.length) return;
  var lb = document.getElementById("lightbox");
  if (!lb) return;
  var img = lb.querySelector(".lb-img");
  var stage = lb.querySelector(".lb-stage");
  var count = lb.querySelector(".lb-count");
  var zLabel = lb.querySelector(".lb-zoom");
  var idx = 0, last = null, z = 1, tx = 0, ty = 0, drag = null, moved = false;

  function apply() {
    img.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + z + ")";
    zLabel.textContent = Math.round(z * 100) + "%";
    img.classList.toggle("zoomed", z > 1);
  }
  function clampPan() {
    var r = stage.getBoundingClientRect();
    var mx = (r.width * (z - 1)) / 2, my = (r.height * (z - 1)) / 2;
    tx = Math.max(-mx, Math.min(mx, tx));
    ty = Math.max(-my, Math.min(my, ty));
  }
  function setZoom(nz) {
    z = Math.max(1, Math.min(4, nz));
    if (z === 1) { tx = 0; ty = 0; }
    clampPan(); apply();
  }
  function reset() { z = 1; tx = 0; ty = 0; apply(); }

  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    var inner = a.querySelector("img");
    reset();
    img.style.width = "";
    img.onload = function () {
      var nw = img.naturalWidth, nh = img.naturalHeight;
      if (!nw || !nh) return;
      var w = Math.min(nw * 3, stage.clientWidth);
      if ((nh * w) / nw > stage.clientHeight) w = (stage.clientHeight * nw) / nh;
      img.style.width = Math.round(w) + "px";
      img.style.height = "auto";
    };
    img.src = a.getAttribute("href");
    img.alt = inner ? inner.alt : "";
    count.textContent = links.length > 1 ? (idx + 1) + " / " + links.length : "";
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function hide() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    reset();
    if (last) last.focus();
  }

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      last = a;
      show(i);
    });
  });

  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target === stage || e.target.classList.contains("lb-close")) hide();
  });

  lb.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var k = b.getAttribute("data-zoom");
      if (k === "0") reset();
      else setZoom(k === "1" ? z * 1.5 : z / 1.5);
    });
  });

  img.addEventListener("click", function (e) {
    e.stopPropagation();
    if (moved) { moved = false; return; }
    setZoom(z > 1 ? 1 : 2.5);
  });
  stage.addEventListener("wheel", function (e) {
    if (!lb.classList.contains("open")) return;
    e.preventDefault();
    setZoom(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
  }, { passive: false });

  img.addEventListener("pointerdown", function (e) {
    moved = false;
    if (z <= 1) return;
    e.preventDefault();
    drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
    img.classList.add("dragging");
    img.setPointerCapture(e.pointerId);
  });
  img.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > 5 || Math.abs(e.clientY - drag.y) > 5) moved = true;
    tx = drag.tx + (e.clientX - drag.x);
    ty = drag.ty + (e.clientY - drag.y);
    clampPan(); apply();
  });
  function endDrag() { drag = null; img.classList.remove("dragging"); }
  img.addEventListener("pointerup", endDrag);
  img.addEventListener("pointercancel", endDrag);

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") { e.preventDefault(); hide(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(z * 1.5); }
    else if (e.key === "-") { e.preventDefault(); setZoom(z / 1.5); }
    else if (e.key === "0") { e.preventDefault(); reset(); }
  });
})();
</script>
</body>
</html>`;

const socials = () => `
<ul class="socials">
  ${site.socials
    .map((s) => {
      const key = s.label.toLowerCase();
      const glyph = key === "github" ? icon("github") : key === "email" ? icon("mail") : key === "rss" ? icon("rss") : "";
      return `<li><a href="${s.href}" aria-label="${esc(s.label)}">${glyph}</a></li>`;
    })
    .join("\n  ")}
</ul>`;

const projectCard = (p, i = 0) => `
<article class="tile">
  <a class="tile-media" href="${p.href}" style="--t1:${p.tint?.[0] ?? "#2f6572"};--t2:${p.tint?.[1] ?? "#0f242c"}" aria-label="${esc(p.name)}">
    ${p.image ? `<img src="${p.image}" alt="${esc(p.name)} screenshot" loading="lazy">` : `<span class="tile-glyph">${String(i + 1).padStart(2, "0")}</span>`}
    <span class="tile-year">${esc(p.year)}</span>
  </a>
  <div class="tile-body">
    <h3><a href="${p.href}">${esc(p.name)}</a></h3>
    <p>${esc(p.desc)}</p>
    <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
  </div>
</article>`;

const PORTRAIT_SVG = `<svg viewBox="0 0 400 400" role="img">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#162a38"/>
            <stop offset=".42" stop-color="#3c3f56"/>
            <stop offset=".66" stop-color="#9a5c58"/>
            <stop offset=".84" stop-color="#e0905c"/>
            <stop offset="1" stop-color="#f4bd7c"/>
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2f6572"/>
            <stop offset="1" stop-color="#0f242c"/>
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" stop-color="#ffd9a0" stop-opacity=".85"/>
            <stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#sky)"/>
        <circle cx="200" cy="214" r="120" fill="url(#sunGlow)"/>
        <circle cx="200" cy="214" r="32" fill="#ffe7bd"/>
        <path d="M0 268 L58 244 L104 258 L152 238 L196 262 L246 240 L292 258 L344 242 L400 260 L400 276 L0 276 Z" fill="#162b34" opacity=".95"/>
        <rect y="270" width="400" height="130" fill="url(#sea)"/>
        <g fill="#ffd9a0" opacity=".32">
          <rect x="186" y="284" width="28" height="2.5" rx="1.2"/>
          <rect x="191" y="297" width="18" height="2.5" rx="1.2"/>
          <rect x="195" y="310" width="11" height="2.5" rx="1.2"/>
        </g>
        <g stroke="#4f8d99" stroke-opacity=".34" fill="none" stroke-width="2">
          <path d="M0 304 q44 -7 88 0 t88 0 t88 0 t88 0 t88 0"/>
          <path d="M0 336 q44 -6 88 0 t88 0 t88 0 t88 0 t88 0"/>
          <path d="M0 368 q44 -6 88 0 t88 0 t88 0 t88 0 t88 0"/>
        </g>
        <path d="M74 140 q8 -8 16 0 q8 -8 16 0" stroke="#0f2029" stroke-opacity=".7" fill="none" stroke-width="2"/>
        <path d="M276 124 q6 -6 12 0 q6 -6 12 0" stroke="#0f2029" stroke-opacity=".55" fill="none" stroke-width="2"/>
      </svg>`;

const portraitArt = () =>
  site.portrait
    ? `<img class="portrait-img" src="${site.portrait}" alt="${esc(site.name)}">`
    : PORTRAIT_SVG;

export const home = () => `
<section class="hero">
  <div class="sea" aria-hidden="true">
    <span class="glow g1"></span><span class="glow g2"></span><span class="horizon"></span>
  </div>
  <div class="hero-inner">
    <div class="portrait" aria-hidden="true">
      ${portraitArt()}
    </div>
    <p class="avail"><span class="dot"></span>${esc(site.available)}</p>
    <h1>${esc(site.name)}</h1>
    <p class="role">${esc(site.role)}</p>
    <p class="tagline">${esc(site.tagline)}</p>
    <div class="hero-actions">
      <a class="btn btn-solid" href="/projects/">See the work</a>
      <a class="btn btn-ghost" href="/cv/">Read the CV</a>
    </div>
    ${socials()}
  </div>
  <span class="scroll-cue" aria-hidden="true">scroll</span>
</section>

<section class="section" id="what">
  <div class="section-head">
    <span class="label">What I do</span>
  </div>
  <div class="caps">
    ${site.capabilities
      .map(
        (c) => `
    <div class="cap">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.text)}</p>
    </div>`
      )
      .join("")}
  </div>
  <ul class="skills">${site.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
</section>

<section class="section" id="work">
  <div class="section-head">
    <span class="label">Selected work</span>
    <a href="/projects/" class="more">All projects →</a>
  </div>
</section>
<div class="marquee">
  <div class="marquee-track">
    <div class="set">${site.projects.map(projectCard).join("")}</div>
    <div class="set" aria-hidden="true" inert>${site.projects.map(projectCard).join("")}</div>
    <div class="set" aria-hidden="true" inert>${site.projects.map(projectCard).join("")}</div>
    <div class="set" aria-hidden="true" inert>${site.projects.map(projectCard).join("")}</div>
  </div>
</div>

${
  site.experience.length
    ? `<section class="section" id="experience">
  <div class="section-head"><span class="label">Experience</span></div>
  <ol class="timeline">
    ${site.experience
      .map(
        (e) => `
    <li>
      <span class="period">${esc(e.period)}</span>
      <div>
        <h3>${esc(e.role)} <span class="at">· ${esc(e.company)}</span></h3>
        <p>${esc(e.note)}</p>
      </div>
    </li>`
      )
      .join("")}
  </ol>
</section>`
    : ""
}

<section class="cta">
  <div class="cta-inner">
    <span class="label">Open to work</span>
    <h2>Let's build something.</h2>
    <a class="cta-mail" href="mailto:${site.email}">${esc(site.email)} <span aria-hidden="true">↗</span></a>
    <p class="cta-meta">${esc(site.location)} · remote-friendly</p>
  </div>
</section>`;

export const postsIndex = (posts) => `
<section class="page-head">
  <span class="label">Writing</span>
  <h1>Notes from the workbench</h1>
  <p class="page-sub">${posts.length} post${posts.length === 1 ? "" : "s"} so far — the problems worth writing down.</p>
</section>
<section class="section tight">
  <div class="post-list">
    ${posts
      .map(
        (p) => `
    <article class="post-card">
      <a href="${p.url}">
        <span class="post-date">${fmtDate(p.date)}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.excerpt)}</p>
        <ul class="tags">${(p.tags ?? []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </a>
    </article>`
      )
      .join("")}
  </div>
</section>`;

export const postPage = (p) => `
<article class="article">
  <header class="article-head">
    <span class="label">${esc(p.tag ?? "writing")}</span>
    <h1>${esc(p.title)}</h1>
    <p class="article-meta"><time datetime="${isoDate(p.date)}">${fmtDate(p.date)}</time> · ${p.readingTime} min read</p>
  </header>
  <div class="prose">
${p.html}
  </div>
</article>`;

export const projectsPage = (projects) => `
<section class="page-head">
  <span class="label">Projects</span>
  <h1>Things I build</h1>
  <p class="page-sub">Tools, experiments and the odd piece of infrastructure.</p>
</section>
<section class="section tight">
  <div class="tiles">${projects.map((p, i) => projectCard(p, i)).join("")}</div>
</section>`;

export const cvPage = (html) => `
<article class="article cv">
  <header class="article-head">
    <span class="label">Curriculum vitae</span>
    <h1>${esc(site.name)}</h1>
    <p class="article-meta">${esc(site.role)} · ${esc(site.location)} · <a href="mailto:${site.email}">${esc(site.email)}</a></p>
    <p class="cv-print"><button onclick="window.print()">Print / save as PDF</button></p>
  </header>
  <div class="prose">
${html}
  </div>
</article>`;

export const notFound = () => `
<section class="page-head">
  <span class="label">404</span>
  <h1>Nothing here</h1>
  <p class="page-sub"><a href="/">Back to the front page →</a></p>
</section>`;
