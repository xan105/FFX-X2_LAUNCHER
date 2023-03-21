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
  
if(env["NODE_ENV"] === "dev") 
  console.log("Game dir:", gamePath);

export { gamePath };