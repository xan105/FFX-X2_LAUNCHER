import { spawn } from "node:child_process";
import { join } from "node:path";
import { app } from "electron";
import {
  shouldObj,
  shouldObjLike,
  shouldBoolean,
  shouldStringNotEmpty
} from "@xan105/is/assert";
import {
  isStringNotEmpty,
  isArrayOfStringNotEmpty
} from "@xan105/is";
import { Failure } from "@xan105/error";

function run(name, wait, callback = ()=>{}){
  return new Promise((resolve, reject) => {
    shouldStringNotEmpty(name);
    shouldBoolean(wait);
    if (typeof callback !== "function") throw new Failure("Expected function", 1);

    const games = {
      "ffx": {
        binary: "FFX.exe",
        args: []
      },
      "ffx_ec": {
        binary: "FFX.exe",
        args: ["_ECalm"]
      },
      "ffx2": {
        binary: "FFX-2.exe",
        args: []
      },
      "ffx2_lm": {
        binary: "FFX-2.exe",
        args: ["FFX2_LASTMISSION"]
      },
      "credits": {
        binary: "FFX&X-2_Will.exe",
        args: []
      }
    };
    
    const game = games[name];
    shouldObjLike(game,{
      binary: isStringNotEmpty,
      args: isArrayOfStringNotEmpty
    });
    
    const cwd = app.getAppPath();
    const file = join(cwd, game.binary);

    let binary = spawn(file, game.args, {
      cwd,
      stdio:[ "ignore", "ignore", "ignore" ], 
      detached: true
    });

    binary.once("error", (err) => {
      binary = null;
      reject(err);
    });
    
    binary.once("spawn", () => {
      binary.unref();
      if(wait){
        callback();
        binary.once("exit", () => {
          binary = null;
          resolve();
        });
      } else {
        binary = null;
        resolve();
      }
    });
  });
}

export { run };