/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the "build" directory of this source tree.
*/

import { fileURLToPath } from "node:url";
import { join, dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { shouldStringNotEmpty } from "@xan105/is/assert";
import { asArrayOfSomeObjLike } from "@xan105/is/opt";
import { isStringNotEmpty, is64bit } from "@xan105/is";

async function rcedit(execFilePath, option = {}){
  
  shouldStringNotEmpty(execFilePath);
  
  const executionLevels = ["asInvoker", "highestAvailable", "requireAdministrator"];
  
  const options = {
    icon: option.icon,
    version: option.version,
    info: asArrayOfSomeObjLike(option.info, {
      name: isStringNotEmpty,
      value: isStringNotEmpty
    }) ?? [],
    level: executionLevels.includes(option.level) ? option.level : executionLevels[0] 
  };

  const x64 = await is64bit(execFilePath);

  const bin = join(
    dirname(fileURLToPath(import.meta.url)), 
    "../vendor/rcedit", 
    `rcedit-${x64 ? "x64" : "x86"}.exe`
  );
  
  const args = [ 
    resolve(execFilePath),
    "--set-requested-execution-level",
    options.level
  ];
  
  if(isStringNotEmpty(options.icon)){
    args.push("--set-icon");
    args.push(resolve(options.icon));
  }
  
  if(isStringNotEmpty(options.version)){
    args.push("--set-file-version");
    args.push(option.version);
    args.push("--set-product-version");
    args.push(option.version);
  }
  
  for (const { name, value } of options.info){
    args.push("--set-version-string");
    args.push(name);
    args.push(value);
  }
  
  const output = await promisify(execFile)(bin, args, { windowsHide: true });
  return output;
}

export { rcedit };