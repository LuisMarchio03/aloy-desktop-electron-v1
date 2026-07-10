const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        ipcRenderer.send(channel, args);
    },
    pickFolder: () => ipcRenderer.invoke("pick-folder"),
    getLanUrl: () => ipcRenderer.invoke("get-lan-url"),
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    webServer: {
        start: () => ipcRenderer.invoke("web-server:start"),
        stop: () => ipcRenderer.invoke("web-server:stop"),
        status: () => ipcRenderer.invoke("web-server:status"),
    },
});