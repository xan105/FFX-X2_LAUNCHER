/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { BrowserWindow, dialog } from "electron";
import * as resolution from "win-screen-resolution";
import { run } from "./run.js";
import { vibrateGamepad } from "./gamepad.js";
import { read, write } from "./settings.js";

function listen(webContents){
  /*
    Note to self:
    webContents.ipc.handle(...) is same as
    ipcMain.handle(..., (e, ...)=>{
      e.sender === webContents
    })
    webContents.ipc is like a scoped ipc to webContents instead of global ipcMain which can be invoked by anyone thus requires check(s)
  */
  
  webContents.ipc.handle("menu-action", async (event, name, wait, clean) => {
    const window = BrowserWindow.fromWebContents(event.sender); 
      
    if(name === "exit"){
      window.close();
    } else {
      try {
        await run(name, { 
          wait, 
          clean,
          onStart: () => { 
            window.minimize();
          }
        });
      }catch(err){
        if (err.code === "ENOENT"){
          const filePath = err.message.replace("spawn","").replace("ENOENT","").trim();
          dialog.showMessageBoxSync(window, {
            type: "error",
            title: "Error", 
            message: "Failed to spawn process !",
            detail: `No such file: "${filePath}"`
          });
        } else {
          dialog.showMessageBoxSync(window, {
            type: "error",
            title: "Error", 
            message: err.code,
            detail: err.message
          });
        }
      }
      if(wait === true)
      {
        window.restore();
        window.focus();
      } else {
        window.close();
      } 
    }
  });

  webContents.ipc.handle("display-resolution", () => { 
    const available = resolution.list()
                      .filter(res => res.height <= 2160) //Above 2160p will break ingame UI
                      .map(({width, height}) => `${width}*${height}`); //Stringify
                      
    const { width, height } = resolution.current();
    const current = `${width}*${height}`; //Stringify

    return { available, current };
  });

  
  webContents.ipc.handle("settings-write", async (event, settings) => {
    try{
      await write(settings);
    }catch(err){
      const window = BrowserWindow.fromWebContents(event.sender);
      dialog.showMessageBoxSync(window, {
        type: "error",
        title: "Error", 
        message: err.code,
        detail: err.message
      });
    }
  });

  webContents.ipc.handle("gamepad-vibrate", vibrateGamepad);
  webContents.ipc.handle("settings-read", read);
}

export { listen };