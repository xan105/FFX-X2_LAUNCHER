import { ipcMain } from "electron";

import { run } from "./game/run.js";

function listen(window){
  ipcMain.handle("menu-action", async (event, name, wait = true) => {  
      switch(name){
        case "exit":
          window.close();
          break;
        case "settings":
          console.log("settings");
          break;
        default:
          await run(name, wait, ()=>{
            window.minimize();
          });
          if(wait)
            window.restore();
          else
            window.close();
      }
  });
}

export { listen };