import { arch } from "node:process";
import { fileURLToPath } from "node:url";
import { join, dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { shouldStringNotEmpty } from "@xan105/is/assert";
import { asArrayOfSomeObjLike } from "@xan105/is/opt";
import { isStringNotEmpty } from "@xan105/is";

function rcedit(execFilePath, option = {}){
  
  shouldStringNotEmpty(execFilePath);
  
  const executionLevels = ["asInvoker", "highestAvailable", "requireAdministrator"];
  
  const options = {
    icon: option.icon,
    version: option.version,
    misc: asArrayOfSomeObjLike(option.misc, {
      name: isStringNotEmpty,
      value: isStringNotEmpty
    }) ?? [],
    level: executionLevels.includes(option.level) ? option.level : executionLevels[0] 
  };

  const bin = join(
    dirname(fileURLToPath(import.meta.url)), 
    "../vendor/rcedit", 
    `rcedit-${(arch === "x64") ? "x64" : "x86"}.exe`
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
  
  for (const { name, value } of options.misc){
    args.push("--set-version-string");
    args.push(name);
    args.push(value);
  }
  
  const output = await promisify(execFile)(bin, args, { windowsHide: true });
  return output;
}

export { rcedit };

/*
  --set-icon %~dp0..\{{app}}\icon.ico --set-file-version "1.6.8" --set-product-version "1.6.8" --set-version-string "CompanyName" "Anthony Beaumont" --set-version-string "ProductName" "Achievement Watcher" --set-version-string "FileDescription" "Achievement Watcher" --set-version-string "OriginalFilename" "AchievementWatcher.exe" --set-version-string "InternalName" "AchievementWatcher" --set-version-string "LegalCopyright" "Copyright 2019-2022 Anthony Beaumont."
*/