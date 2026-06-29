// Custom standalone server that serves public/ static files before Next.js
// Workaround for Next.js 16 Turbopack standalone mode not serving public directory
const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

const publicDir = path.join(__dirname, "public");

function serveStatic(req, res) {
  const urlPath = req.url.split("?")[0];
  const filePath = path.join(publicDir, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(publicDir)) return false;
  if (!fs.existsSync(filePath)) return false;

  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": "public, max-age=3600",
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

// Wrap the original server.js by intercepting http.createServer
const originalCreateServer = require("http").createServer;
let requestHandler = null;

require("http").createServer = function (...args) {
  const server = originalCreateServer.apply(this, args);

  // After the server is created, monkey-patch the request handler
  const originalListeners = server.listeners("request").slice();
  server.removeAllListeners("request");
  server.on("request", (req, res) => {
    if (serveStatic(req, res)) return;
    for (const listener of originalListeners) {
      listener.call(server, req, res);
    }
  });

  // Restore original createServer so it only affects the first call
  require("http").createServer = originalCreateServer;
  return server;
};

// Load and run the original Next.js standalone server
require("./server.js");
