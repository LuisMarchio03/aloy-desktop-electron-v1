const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const os = require("os");
const { createWebServer } = require("./web-server");

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

const webServer = createWebServer({ root: path.join(__dirname, "../out"), host: "0.0.0.0", port: 3000 });

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 360,
    minHeight: 480,
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.maximize();

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
}

app.on("ready", () => {
    ipcMain.handle("pick-folder", async () => {
        const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
        if (res.canceled || res.filePaths.length === 0) return null;
        return res.filePaths[0];
    });
    ipcMain.handle("get-lan-url", () => {
        const ifaces = os.networkInterfaces();
        const SKIP = /^(docker|br-|veth|tailscale|tun|wg|utun|vmnet|virbr)/i;
        const candidates = [];
        for (const name of Object.keys(ifaces)) {
            if (SKIP.test(name)) continue; // ignora docker/VPN
            for (const net of ifaces[name] || []) {
                if (net.family === "IPv4" && !net.internal) candidates.push(net.address);
            }
        }
        // prefere LAN doméstica: 192.168.x > 10.x > 172.16-31 > qualquer
        const score = (a) =>
            a.startsWith("192.168.") ? 3
            : /^10\./.test(a) ? 2
            : /^172\.(1[6-9]|2\d|3[01])\./.test(a) ? 1
            : 0;
        candidates.sort((a, b) => score(b) - score(a));
        const ip = candidates[0] || "127.0.0.1";
        return `http://${ip}:3000`;
    });
    ipcMain.handle("open-external", (_e, url) => shell.openExternal(url));
    ipcMain.handle("web-server:start", async () => {
        if (!app.isPackaged) return { running: true, url: `http://127.0.0.1:3000` };
        return webServer.start();
    });
    ipcMain.handle("web-server:stop", async () => {
        if (!app.isPackaged) return { running: true, url: `http://127.0.0.1:3000` };
        return webServer.stop();
    });
    ipcMain.handle("web-server:status", async () => {
        if (!app.isPackaged) return { running: true, url: `http://127.0.0.1:3000` };
        return webServer.status();
    });
    createWindow();
});

app.on("window-all-closed", () => {
    void webServer.stop();
    if (process.platform !== "darwin") {
        app.quit();
    }
});