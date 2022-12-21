"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRenderer", {
  componentsLoaded: () => ipcRenderer.invoke("components-loaded"),
  onGamepadInput: (callback) => ipcRenderer.on("onGamepadInput", callback)
});