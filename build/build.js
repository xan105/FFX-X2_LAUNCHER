#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the "build" directory of this source tree.
*/

import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { mkdir, ls, copyFile, rm } from "@xan105/fs";
import { rcedit } from "./util/rcedit.js";

const asar = false;

console.log(process.env);

console.log("Creating temporary working dir...");
const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const cwd = join(tmpdir(), `${Date.now()}${rng(0, 1000)}`);
await mkdir(cwd);
console.log("cwd:", cwd);

console.log("Copying metadata...");
for (const file of ["package.json", "package-lock.json", "LICENSE"]){
  await copyFile("./" + file, join(cwd, "resources/app", file));
}

console.log("Copying project files...");
const resources = await ls("./electron", {
  recursive: true,
  normalize: true,
  ignore: { dir: true }
});
for (const file of resources){
  await copyFile(
    join("./electron", file), 
    join(cwd, "resources/app/electron", file)
  );
}

console.log("Dependencies clean install...");
const npm_ci = await promisify(exec)("npm ci", {
  cwd: join(cwd, "resources/app"),
  windowsHide: true
});
console.log(npm_ci);

console.log("Copying distributable electron...");
const files = await ls(join(cwd, "resources/app/node_modules/electron/dist"), {
  recursive: true,
  normalize: true,
  ignore: { dir: true },
  filter: ["version"]
});
for (const file of files){
  await copyFile(
    join(cwd, "resources/app/node_modules/electron/dist", file), 
    join(cwd, file)
  );
}

/*
console.log("Patching electron.exe")
use npm env var to get value from package.json when run by npm
rcedit(...args)
*/

console.log("Removing dev dependencies...");
const npm_prune = await promisify(exec)("npm prune --production", {
  cwd: join(cwd, "resources/app"),
  windowsHide: true
});
console.log(npm_prune);

if(asar){
  console.log("Packing into an .asar file...");
  const src = join(cwd, "resources/app");
  const dest = join(cwd, "resources/app.asar");
  const npx_asar = await promisify(exec)(`npx asar pack "${src}" "${dest}" --unpack {*.node,*.dll}`, {
    windowsHide: true
  });
  console.log(npx_asar);
  
  console.log("Cleaning up...")
  await rm(join(cwd, "resources/app"));
}

//enigma self contain package