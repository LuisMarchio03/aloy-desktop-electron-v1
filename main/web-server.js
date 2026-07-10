const http = require("http");
const fs = require("fs");
const { resolveStaticFile } = require("./web-server-core.js");

// true só pra ARQUIVO (não diretório): assim uma rota que colide com um dir
// cai no fallback SPA (index.html) em vez de virar EISDIR→404.
function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function createWebServer({ root, host = "0.0.0.0", port = 3000 }) {
  let server = null;
  let boundPort = port;
  let lastError = null;

  function urlFor() {
    const h = host === "0.0.0.0" ? "127.0.0.1" : host;
    return `http://${h}:${boundPort}`;
  }

  function handle(req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405); return res.end("method not allowed");
    }
    if (!fs.existsSync(root)) {
      res.writeHead(503, { "content-type": "text/plain" });
      return res.end("build ausente (rode next build)");
    }
    const r = resolveStaticFile(root, req.url, fileExists);
    if (r.notFound) { res.writeHead(404); return res.end("not found"); }
    const file = r.filePath;
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "content-type": r.contentType });
      res.end(req.method === "HEAD" ? undefined : data);
    });
  }

  function start() {
    return new Promise((resolve) => {
      if (server) return resolve(status());
      lastError = null;
      server = http.createServer(handle);
      server.on("error", (e) => {
        lastError = e.message; server = null; resolve(status());
      });
      server.listen(port, host, () => {
        boundPort = server.address().port;
        resolve(status());
      });
    });
  }

  function stop() {
    return new Promise((resolve) => {
      if (!server) return resolve(status());
      server.close(() => { server = null; resolve(status()); });
    });
  }

  function status() {
    if (server) return { running: true, url: urlFor() };
    return lastError ? { running: false, error: lastError } : { running: false };
  }

  return { start, stop, status };
}

module.exports = { createWebServer };
