const path = require("path");
const { createWebServer } = require("./web-server");

const root = path.join(__dirname, "..", "out");
const host = process.env.ALOY_WEB_HOST || "0.0.0.0";
const port = Number(process.env.ALOY_WEB_PORT) || 3000;
const server = createWebServer({ root, host, port });

server.start().then((st) => {
  console.log("aloy-web:", JSON.stringify(st));
  if (!st.running) {
    console.error("falha ao subir o servidor da UI:", JSON.stringify(st));
    process.exit(1);
  }
});

const bye = () => server.stop().then(() => process.exit(0));
process.on("SIGTERM", bye);
process.on("SIGINT", bye);
