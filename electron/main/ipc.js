import { ipcMain, dialog } from "electron";

import { run } from "./game/run.js";
import { vibrateGamepad } from "./gamepad.js";

function listen(window){

  ipcMain.handle("menu-action", async (event, name, wait = true) => {  
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
          } else
            dialog.showMessageBoxSync(window, {
              type: "error",
              title: "Error", 
              message: err.code,
              detail: err.message
          });
        }
        if(wait)
          window.restore();
        else
          window.close();
          
      }
  });
}

ipcMain.handle("gamepad-vibrate", vibrateGamepad);

export { listen };