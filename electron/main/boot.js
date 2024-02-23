/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  app, 
  BrowserWindow, 
  dialog, 
  session, 
  shell,
  Menu,
  ipcMain
} from "electron";

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { env, versions } from "node:process";

const debug = env["NODE_ENV"] === "dev";
const cwd = join(dirname(fileURLToPath(import.meta.url)));

let mainWin;

async function setApplication(){

  if (app.requestSingleInstanceLock() !== true) app.exit();
  app.on("second-instance", () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  if (debug) console.info((({node,electron,chrome})=>({node,electron,chrome}))(versions));
  
  const { default: { name } } = await import("../../package.json", { assert: { type: "json" } });
  
  app.setAppUserModelId(name);
  app.disableHardwareAcceleration();
}

async function addDebugMenu(window){ //Debug tool
  try { 
    window.webContents.openDevTools({mode: "undocked"});
    const { default: contextMenu } = await import("electron-context-menu");
    contextMenu({
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
  //User agent
  window.webContents.userAgent = "Chrome/";
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "Chrome/";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

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

async function createWindow(){

  const { default: Windows } = await import ("./window.json", { assert: { type: "json" } });
  const { options } = Windows.main;
  
  options.show = false;
  options.webPreferences = {
    devTools: debug,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    contextIsolation: true,
    sandbox: true,
    webviewTag: false,
    v8CacheOptions: debug ? "none" : "code",
    preload: join(cwd, Windows.main.preload)
  };
  options.icon = join(cwd, options.icon);
  if (options.frame === true) options.useContentSize = true;

  mainWin = new BrowserWindow(options);
  if(Windows.main.menu === true){
    mainWin.setMenuBarVisibility(true);
  } else {
    Menu.setApplicationMenu(null);
    mainWin.setMenuBarVisibility(false);
  }
  
  const [ width, height ] = mainWin.getContentSize();
  if (height !== options.height){
    mainWin.setContentSize(width, options.height);
    console.warn(`Resize window from ${height}px to expected ${options.height}px !`);
  }

  mainWin.once("closed", () => {
    mainWin = null; //deref
  });
  
  if (debug) await addDebugMenu(mainWin);

  openExternalLink(mainWin);
  
  //ipc
  const { listen } = await import("./ipc.js");
  listen(mainWin.webContents);
        
  await Promise.all([
    new Promise((resolve) => { 
      mainWin.once("ready-to-show", resolve); //Window is loaded and ready to be drawn
    }),
    new Promise((resolve) => {  
      ipcMain.handleOnce("components-loaded", resolve); //Wait for custom event 
    }),
    mainWin.loadFile(join(cwd, Windows.main.view))
  ]);
  
  const { hookGamepad } = await import("./gamepad.js");
  hookGamepad(mainWin);

  mainWin.show();
  mainWin.focus();
}

setApplication()
.then(app.whenReady)
.then(createWindow)
.catch((err)=>{
  console.error(err);
  dialog.showErrorBox("Critical Error", `Failed to initialize:\n\n${err}`);
  app.quit();
});