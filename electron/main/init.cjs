/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

"use strict";

const { 
  app, 
  BrowserWindow, 
  dialog, 
  session, 
  shell,
  ipcMain
} = require("electron");
const { join } = require("node:path");

function onError(err){
  console.error(err);
  dialog.showErrorBox("Critical Error", `Failed to initialize:\n${err}`);
  app.quit();
}

function addDebugMenu(window){ //Debug tool
  try { 
    window.webContents.openDevTools({mode: "undocked"});
    const contextMenu = require("electron-context-menu")({
      append: (defaultActions, params, browserWindow) => [{
          label: "Reload", visible: params, click: () => { window.reload() }
      }]
    });
  }catch(err){
    dialog.showMessageBoxSync({
      type: "warning",
      title: "Context Menu", 
      message: "Failed to initialize context menu.", 
      detail: `${err}`
    });
  }
}

function openExternalLink(window){
  window.webContents.on("will-navigate", (event, url) => { //a href
    event.preventDefault();
    if (!url.startsWith("file:///")) 
      shell.openExternal(url).catch(()=>{});
  });
  window.webContents.setWindowOpenHandler(({ url }) => { //a href target="_blank"
    if (!url.startsWith("file:///"))
      shell.openExternal(url).catch(()=>{});
    return { action: "deny" };
  });
}

try {
  if (app.requestSingleInstanceLock() !== true) app.quit();

  let mainWin;
    
  app.on("second-instance", () => {
    console.log("second-instance");
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  const debug = process.env["NODE_ENV"] === "dev";
  const { name } = require("../../package.json");
  app.setAppUserModelId(name);
  app.disableHardwareAcceleration();

  app.whenReady()
  .then(() => {

    const { main } = require("./window.json");
    const options = main.window;
    options.show = false;
    options.webPreferences = {
      devTools: debug,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
      v8CacheOptions: debug ? "none" : "code",
      preload: join(__dirname, main.preload)
    };
    options.icon = join(__dirname, options.icon);
    if (options.frame === true) options.useContentSize = true;

    mainWin = new BrowserWindow(options);
    mainWin.setMenuBarVisibility(main.menuBar ?? true);
      
    mainWin.on("closed", () => {
      mainWin = null; //deref
    });

    if(debug){
      console.info((({node,electron,chrome })=>({node,electron,chrome}))(process.versions));
      addDebugMenu(mainWin);
    }

    //User agent
    mainWin.webContents.userAgent = "Chrome/";
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders["User-Agent"] = "Chrome/";
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    
    openExternalLink(mainWin);

    Promise.all([
      new Promise((resolve) => { 
        mainWin.once("ready-to-show", resolve); //Window is loaded and ready to be drawn
      }),
      new Promise((resolve) => {  
        ipcMain.handleOnce("components-loaded", resolve); //Wait for custom event 
      })
    ])
    .then(async() => {

      const { listen } = await import("./ipc.js");
      listen(mainWin.webContents);
        
      const { hookGamepad } = await import("./gamepad.js");
      hookGamepad(mainWin);
      
      mainWin.show();
      mainWin.focus();

    }).catch(onError);
      
    mainWin.loadFile(join(__dirname, main.view));
      
  }).catch(onError);
}catch(err) { onError(err) }