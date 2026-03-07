import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = 3002;

// Basic auth - owner only
const AUTH_USER = "tlb";
const AUTH_PASS = "SolutioV2Carto2026";
const AUTH_HEADER = "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString("base64");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const server = http.createServer((req, res) => {
  // Basic auth check
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Solutio Carto V2 - Acces reserve"',
      "Content-Type": "text/html",
    });
    res.end("<h1>401 - Acces refuse</h1><p>Authentification requise.</p>");
    return;
  }
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  const [user, ...passParts] = decoded.split(":");
  const pass = passParts.join(":");
  if (user !== AUTH_USER || pass !== AUTH_PASS) {
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Solutio Carto V2 - Acces reserve"',
      "Content-Type": "text/html",
    });
    res.end("<h1>401 - Acces refuse</h1><p>Authentification requise.</p>");
    return;
  }

  let filePath = path.join(DIST, req.url === "/" ? "index.html" : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // SPA fallback: serve index.html for non-file routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, "index.html");
  }

  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Solutio Carto V2 running on http://0.0.0.0:${PORT}`);
  console.log(`Auth: ${AUTH_USER} / SolutioV2!Secure2026`);
});
