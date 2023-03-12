import { shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";
import { XInputGamepad } from "xinput-ffi/promises";

let gamepad = new XInputGamepad({
  hz: 30,
  multitap: true,
  joystickAsDPAD: true,
  inputFeedback: false 
});

function hookGamepad(window, option = {}){

  shouldObj(option);
  
  const options = {
    autofocus: asBoolean(option.autofocus) ?? true
  };

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
      window.webContents.send("onGamepadInput", buttons);
    });
  });
  
  gamepad.poll();
}

function vibrateGamepad(){
  return gamepad.vibrate({force: [0, 50], duration: 128});
}

export { hookGamepad, vibrateGamepad };