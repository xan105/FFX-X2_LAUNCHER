import { ipcMain, BrowserWindow, dialog } from "electron";
import * as resolution from "win-screen-resolution";
import { run } from "./run.js";
import { vibrateGamepad } from "./gamepad.js";
import { read, write } from "./settings.js";

ipcMain.handle("menu-action", async (event, name, wait = true) => {  
    
  const window = BrowserWindow.fromWebContents(event.sender);
    
  if(name === "exit"){
    window.close();
  } else {
    try {
      await run(name, wait, window.minimize);
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
    if(wait)
      window.restore();
    else
      window.close();  
  }
});

ipcMain.handle("gamepad-vibrate", vibrateGamepad);

ipcMain.handle("display-resolution", ()=>{ 
  
  const available = resolution.list()
                    .filter(res => res.height <= 2160) //Above 2160p will break ingame UI
                    .map(({width, height}) => `${width}*${height}`); //Stringify
                    
  const { width, height } = resolution.current();
  const current = `${width}*${height}`; //Stringify

  return { available, current };
});

ipcMain.handle("settings-read", read);
ipcMain.handle("settings-write", async (event, settings) => {
  
  const window = BrowserWindow.fromWebContents(event.sender);
  
  try{
    await write(settings);
  }catch(err){
    dialog.showMessageBoxSync(window, {
      type: "error",
      title: "Error", 
      message: err.code,
      detail: err.message
    });
  }
});

console.log("ipc done");