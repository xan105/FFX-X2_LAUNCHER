"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRenderer", {
  onGamepadInput: (callback) => ipcRenderer.on("onGamepadInput", callback),
  componentsLoaded: () => ipcRenderer.invoke("components-loaded"),
  gamepadVibrate: () => ipcRenderer.invoke("gamepad-vibrate"),
  menuAction: (name) => ipcRenderer.invoke("menu-action", name),
  displayResolution: () => ipcRenderer.invoke("display-resolution"),
  settingsRead: () => ipcRenderer.invoke("settings-read"),
  settingsWrite: (settings) => ipcRenderer.invoke("settings-write", settings)
});