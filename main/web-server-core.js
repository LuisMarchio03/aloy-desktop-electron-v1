const path = require("path");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".map": "application/json",
  ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".txt": "text/plain", ".webmanifest": "application/manifest+json",
};

function contentTypeFor(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

// root: dir absoluto do build (out/). urlPath: caminho da requisição (pode ter query).
// exists(absPath) -> bool (injetável; o server passa fs.existsSync).
function resolveStaticFile(root, urlPath, exists) {
  let raw;
  try {
    raw = decodeURIComponent((urlPath || "/").split("?")[0]);
  } catch {
    return { notFound: true };
  }
  const rel = raw === "/" ? "index.html" : raw.replace(/^\/+/, "");
  const abs = path.normalize(path.join(root, rel));
  // path-safe: precisa ficar dentro de root (bloqueia ..)
  if (abs !== root && !abs.startsWith(root + path.sep)) return { notFound: true };
  if (exists(abs)) return { filePath: abs, contentType: contentTypeFor(abs) };
  // fallback SPA: rota sem extensão → index.html; com extensão → 404
  if (path.extname(abs) === "") {
    return { indexFallback: true, filePath: path.join(root, "index.html"), contentType: "text/html" };
  }
  return { notFound: true };
}

module.exports = { resolveStaticFile, contentTypeFor };
