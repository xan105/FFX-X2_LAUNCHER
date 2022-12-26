import { shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";
import { XInputGamepad } from "xinput-ffi/promises";

function hookGamepad(window, option = {}){

  shouldObj(option);
  
  const options = {
    autofocus: asBoolean(option.autofocus) ?? true
  };

  let gamepad = new XInputGamepad({
    inputFeedback: process.env["NODE_ENV"] === "dev" 
  });
  
  if (options.autofocus){
    window.on("blur", () => {
      gamepad?.pause();
    });
    window.on("focus", () => {
      gamepad?.resume();
    });
    
    window.on("minimize", () => {
      gamepad?.pause();
    });
    window.on("restore", () => {
      gamepad?.resume();
    });
  }
  
  window.on("close", () => {
    gamepad?.removeAllListeners();
    gamepad?.stop();
    gamepad = null; //deref
  });
  
  gamepad.on("input", (buttons) => { 
    setImmediate(() => {
      window.webContents.send("onGamepadInput", buttons[0]);
    });
  });
  
  gamepad.poll();
}

export { hookGamepad };