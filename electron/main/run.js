import { spawn } from "node:child_process";
import { join } from "node:path";
import { app } from "electron";
import { rm } from "@xan105/fs";
import games from "./game.json" assert { type: "json" };

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

function run(name, wait, clean, callback = ()=>{}){
  return new Promise((resolve, reject) => {
    shouldStringNotEmpty(name);
    shouldBoolean(wait);
    shouldBoolean(clean);
    if (typeof callback !== "function") throw new Failure("Expected function", 1);

    const game = games[name];
    shouldObjLike(game,{
      binary: isStringNotEmpty,
      args: isArrayOfStringNotEmpty
    });
    
    const cwd = /*app.getAppPath();*/ "G:\\Library\\SteamLibrary\\steamapps\\common\\FINAL FANTASY FFX&FFX-2 HD Remaster"
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
          if(clean){
            Promise.all([
              rm(join(cwd, "OUTPUT.TXT")),
              rm(join(cwd, "logs"))
            ]);
          }
        });
      } else {
        binary = null;
        resolve();
      }
    });
  });
}

export { run };