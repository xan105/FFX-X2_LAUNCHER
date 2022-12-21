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

try {

  const debug = process.env["NODE_ENV"] === "dev";
  if (app.requestSingleInstanceLock() !== true) app.quit();

  const manifest = require("../../package.json");
  app.setAppUserModelId(manifest.name);
  app.disableHardwareAcceleration();
  
  let mainWin;
  
  app.on("ready", function(){

    const { main } = require("./win.json");
    
    let options = main.window;
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
    
    //Debug tool
    if (debug) {
      mainWin.webContents.openDevTools({mode: "undocked"});
      console.info((({node,electron,chrome })=>({node,electron,chrome}))(process.versions));
      try {
        const contextMenu = require("electron-context-menu")({
          append: (defaultActions, params, browserWindow) => [{
            label: "Reload", visible: params, click: () => { mainWin.reload() }
          }]
        });
      }catch(err){
        dialog.showMessageBoxSync({type: "warning",title: "Context Menu", message: "Failed to initialize context menu.", detail: `${err}`});
      }
    }

    //User agent
    mainWin.webContents.userAgent = "Chrome/";
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders["User-Agent"] = "Chrome/";
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    //External open links
    const openExternal = function(event, url) {
      if (!url.startsWith("file:///")) {
        event.preventDefault();
        shell.openExternal(url).catch(()=>{});
      }
    };
    mainWin.webContents.on("will-navigate", openExternal); //a href
    mainWin.webContents.on("new-window", openExternal); //a href target="_blank"
    
    const isReady = [
      new Promise(function(resolve) { 
        mainWin.once("ready-to-show", () => { return resolve() }); //Window is loaded and ready to be drawn
      }),
      new Promise(function(resolve) { 
        ipcMain.handleOnce("components-loaded", () => { return resolve() }); //Wait for custom event 
      })
    ];

    let gamepad;
    
    Promise.all(isReady).then(async() => {
      const { XInputGamepad } = await import("xinput-ffi/promises");
      
      gamepad = new XInputGamepad({inputForceFeedback: true});
      gamepad.on("input", (buttons)=>{ 
        setImmediate(() => {
          mainWin.webContents.send("ongamepadInput", buttons[0]);
        });
      });
        
      gamepad.poll();
      mainWin.show();
      mainWin.focus();
    }).catch(err => onError(err));

    mainWin.on("blur", () => {
      gamepad?.pause();
    });
    mainWin.on("minimize", () => {
      gamepad?.pause();
    });
    
    mainWin.on("focus", () => {
      gamepad?.resume();
    });
    mainWin.on("restore", () => {
      gamepad?.resume();
    });
    
    mainWin.on("closed", () => {
      mainWin = null;
      gamepad?.removeAllListeners();
      gamepad?.stop();
      gamepad = null;
    });
    
    mainWin.loadFile(join(__dirname, main.view));
  })
  .on("window-all-closed", function() {
      app.quit();
  })
  .on("web-contents-created", (event, contents) => {
      contents.on("new-window", (event, url) => {
        event.preventDefault();
      });
   })
   .on("second-instance", (event, argv, cwd) => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

}catch(err) { onError(err) }