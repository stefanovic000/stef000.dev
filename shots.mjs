// Full-page screenshots through the DevTools protocol.
// Usage: node shots.mjs
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const BASE = "http://127.0.0.1:8080";
const OUT = path.join(process.cwd(), "shots");

const pages = [
  { name: "home", url: "/", width: 1440, mobile: false },
  { name: "home-mobile", url: "/", width: 390, mobile: true },
  { name: "projects", url: "/projects/", width: 1440, mobile: false },
  { name: "posts", url: "/posts/", width: 1440, mobile: false },
  { name: "cv", url: "/cv/", width: 1440, mobile: false },
  { name: "post", url: "/posts/google-earth-data/", width: 1440, mobile: false },
  { name: "post-mobile", url: "/posts/google-earth-data/", width: 390, mobile: true },
  { name: "projects-mobile", url: "/projects/", width: 390, mobile: true },
  { name: "cv-mobile", url: "/cv/", width: 390, mobile: true }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("browser did not start");
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const profile = path.join(process.env.TEMP, `edge-cdp-${Date.now()}`);
const edge = spawn(EDGE, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"
], { stdio: "ignore" });

const targets = await waitJson(`http://127.0.0.1:${PORT}/json/list`);
const pageTarget = targets.find((t) => t.type === "page");
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const cdp = new CDP(ws);

await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
fs.mkdirSync(OUT, { recursive: true });

for (const p of pages) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: p.width, height: 900, deviceScaleFactor: 1, mobile: p.mobile
  });
  await cdp.send("Page.navigate", { url: BASE + p.url });
  await sleep(700);
  for (let i = 0; i < 40; i++) {
    const { result } = await cdp.send("Runtime.evaluate", { expression: "document.readyState" });
    if (result.value === "complete") break;
    await sleep(150);
  }
  await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0,0)" });
  await sleep(250);
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const w = Math.ceil(metrics.cssContentSize.width);
  const h = Math.ceil(metrics.cssContentSize.height);
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: w, height: h, scale: 1 }
  });
  fs.writeFileSync(path.join(OUT, `${p.name}.png`), Buffer.from(shot.data, "base64"));
  console.log(`${p.name}: ${w}x${h}`);
}

ws.close();
edge.kill();
await sleep(300);
fs.rmSync(profile, { recursive: true, force: true });
