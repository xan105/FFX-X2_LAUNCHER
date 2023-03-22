#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the "build" directory of this source tree.
*/

import { join, resolve } from "node:path";
import { env } from "node:process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { mkdir, ls, copyFile, rm, mv } from "@xan105/fs";
import { rcedit } from "./util/rcedit.js";

const asar = false;

const cwd = join("./dist");
await rm(cwd);
await mkdir(cwd);
console.log("cwd:", resolve(cwd));

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

console.log("Rebuilding native addon for Electron...");
const npm_rebuild = await promisify(exec)("npm run-script native-rebuild", {
  cwd: join(cwd, "resources/app"),
  windowsHide: true
});
console.log(npm_rebuild);

console.log("Copying redist electron...");
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

console.log("Patching electron.exe")
const rcedit_output = await rcedit("./dist/electron.exe", {
  icon: "./dist/resources/app/electron/renderer/resources/icon/icon.ico",
  version: env["npm_package_version"],
  info: [
    { name: "CompanyName", value: "Anthony Beaumont" },
    { name: "ProductName", value: env["npm_package_name"] },
    { name: "FileDescription", value: env["npm_package_name"] },
    { name: "OriginalFilename", value: env["npm_package_name"] + ".exe" },
    { name: "InternalName", value: env["npm_package_name"] },
    { name: "LegalCopyright", value: "Copyright 2016-2023 Anthony Beaumont." }
  ]
});
await mv("./dist/electron.exe", "./dist/" + env["npm_package_name"] + ".exe");
console.log(rcedit_output);

console.log("Removing dev dependencies...");
const npm_prune = await promisify(exec)("npm prune --production", {
  cwd: join(cwd, "resources/app"),
  windowsHide: true
});
console.log(npm_prune);

console.log("Debloating native-addons...");
const modules = [
  { name: "koffi" },
  { name: "win-screen-resolution", filter: ["node_modules", "bin", "prebuilds"] }
];
for (const module of modules){
  console.log("\t>>>", module.name);
  const files_all = await ls(join(cwd, "resources/app/node_modules", module.name), {
    recursive: true,
    normalize: true,
    ignore: { dir: true }
  });
  
  const files = (await Promise.all([
    ls(join(cwd, "resources/app/node_modules", module.name), {
      recursive: true,
      normalize: true,
      ignore: { dir: true },
      filter: ["LICENSE", "LICENSE.txt"],
      whitelist: true
    }),
    ls(join(cwd, "resources/app/node_modules", module.name), {
      recursive: true,
      normalize: true,
      ignore: { dir: true },
      ext: ["js", "cjs", "mjs", "node", "json", "md"],
      filter: module.filter
    })
  ])).flat();
  
  let counter = 0;
  for (const file of files_all){
    if(!files.includes(file)){
      await rm(join(cwd, "resources/app/node_modules", module.name, file));
      counter += 1;
    }
  }
  console.log(`\t\tRemoved ${counter} files`);
}

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