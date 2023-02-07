import { ipcMain, BrowserWindow, dialog } from "electron";
import * as resolution from "win-screen-resolution";
import { run } from "./game/run.js";
import { vibrateGamepad } from "./gamepad.js";

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

ipcMain.handle("resolution-list", ()=>{ 
  return resolution.list().map(({width, height}) => `${width}x${height}`);
});

ipcMain.handle("resolution-current", ()=>{
  const {width, height} = resolution.current();
  return `${width}x${height}`;
});
  
console.log("ipc done");