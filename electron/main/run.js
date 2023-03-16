import { spawn } from "node:child_process";
import { join } from "node:path";
import { app } from "electron";
import { rm } from "@xan105/fs";
import {
  shouldObj,
  shouldObjLike,
  shouldStringNotEmpty
} from "@xan105/is/assert";
import {
  isStringNotEmpty,
  isArrayOfStringNotEmpty
} from "@xan105/is";
import { asBoolean } from "@xan105/is/opt";
import games from "./game.json" assert { type: "json" };

function run(name, option = {}){
  return new Promise((resolve, reject) => {

    shouldStringNotEmpty(name);
    shouldObj(option);
    const options = {
      wait: asBoolean(option.wait) ?? false,
      clean: asBoolean(option.clean) ?? false,
      onStart: typeof option.onStart === "function" ? option.onStart : ()=>{}
    };

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
      if(options.wait){
        options.onStart();
        binary.once("exit", () => {
          binary = null;
          resolve();
          if(options.clean){
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