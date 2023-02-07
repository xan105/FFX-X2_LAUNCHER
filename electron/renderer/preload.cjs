"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRenderer", {
  componentsLoaded: () => ipcRenderer.invoke("components-loaded"),
  onGamepadInput: (callback) => ipcRenderer.on("onGamepadInput", callback),
  gamepadVibrate: () => ipcRenderer.invoke("gamepad-vibrate"),
  menuAction: (name) => ipcRenderer.invoke("menu-action", name),
  resolutionList: () => ipcRenderer.invoke("resolution-list"),
  resolutionCurrent: () => ipcRenderer.invoke("resolution-current")
});