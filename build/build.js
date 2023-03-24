#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the "build" directory of this source tree.
*/

import { join, resolve, basename  } from "node:path";
import { env } from "node:process";
import { tmpdir } from "node:os";
import { promisify, parseArgs } from "node:util";
import { exec } from "node:child_process";
import cliProgress from "cli-progress";
import { mkdir, ls, copyFile, rm, mv } from "@xan105/fs";
import { rcedit } from "./util/rcedit.js";

async function copy(cwd){
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

  console.log("Copying node_modules...");
  const modules = await ls("./node_modules", {
    recursive: true,
    normalize: true,
    ignore: { dir: true }
  });

  const progress = new cliProgress.SingleBar({
    format: "[{bar}] {percentage}%"
  }, cliProgress.Presets.shades_classic);
  progress.start(modules.length, 0);

  for (const file of modules){
    await copyFile(
      join("./node_modules", file), 
      join(cwd, "resources/app/node_modules", file)
    );
    progress.increment();
  }
  progress.stop();
}

async function mkElectron(cwd){
  console.log("Extracting redist electron...");
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

  console.log("Patching electron.exe...")
  await rcedit("./dist/electron.exe", {
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
}

async function cleaning(cwd){
  console.log("Removing dev dependencies...");
  await promisify(exec)("npm prune --production", {
    cwd: join(cwd, "resources/app"),
    windowsHide: true
  });

  console.log("Debloating native-addons...");
  const nativeModules = [
    { name: "koffi" },
    { name: "win-screen-resolution", filter: ["node_modules", "bin", "prebuilds"] }
  ];
  for (const module of nativeModules){
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
}

async function build(){
  const { values : args} = parseArgs({ 
    asar: {
      type: "boolean",
      default: false
    }
  }, { strict: true });

  const cwd = join("./dist");
  await rm(cwd);
  await mkdir(cwd);
  console.log("cwd:", resolve(cwd));
  
  await copy(cwd);
  await mkElectron(cwd);
  await cleaning(cwd);
  
  if(args.asar === true){
    console.log("Packing into an .asar file...");
    const src = join(cwd, "resources/app");
    const dest = join(cwd, "resources/app.asar");
    await promisify(exec)(`npx asar pack "${src}" "${dest}" --unpack {*.node,*.dll}`, {
      windowsHide: true
    });
    
    console.log("Cleaning up...")
    await rm(join(cwd, "resources/app"));
  }
}

build()
.then(()=>{
	process.exit(0);
}).catch((err)=>{
	console.error(err);
	process.exit(1);
});