/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { dirname } from "node:path";
import { execPath, env } from "node:process";
import { parseArgs } from "node:util";
import { asStringNotEmpty } from "@xan105/is/opt";

const { values : args } = parseArgs({
  options: {
    "gamePath": {
      type: "string"
    }
  },
  strict: false
});

const gamePath = asStringNotEmpty(args.gamePath) ??
                 asStringNotEmpty(env["GAMEPATH"]) ??
                 dirname(execPath);
  
console.log("Game path:", gamePath);

export { gamePath };