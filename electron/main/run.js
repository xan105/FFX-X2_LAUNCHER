/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { spawn } from "node:child_process";
import { join } from "node:path";
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
import { gamePath } from "./gamedir.js";
import games from "./game.json" with { type: "json" };

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
    
    const file = join(gamePath, game.binary);

    let binary = spawn(file, game.args, {
      cwd: gamePath,
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
              rm(join(gamePath, "OUTPUT.TXT")),
              rm(join(gamePath, "logs"))
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