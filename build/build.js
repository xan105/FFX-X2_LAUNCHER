#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the "build" directory of this source tree.
*/

import { join, resolve, basename  } from "node:path";
import { env } from "node:process";
import { promisify, parseArgs } from "node:util";
import { exec } from "node:child_process";

import cliProgress from "cli-progress";
import { flipFuses, FuseVersion, FuseV1Options } from "@electron/fuses";
import { mkdir, ls, copyFile, rm, mv } from "@xan105/fs";
import { is64bit } from "@xan105/is";
import { attemptify } from "@xan105/error";

import { rcedit } from "./util/rcedit.js";

async function copy(cwd){
  console.log("Copying metadata...");
  for (const file of ["package.json", "package-lock.json", "LICENSE", "README.md"]){
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

async function mkElectron(cwd, asar = false){
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
  
  console.log("Fliping Electron Fuses...");
  await flipFuses("./dist/electron.exe",{
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: true, // Disables ELECTRON_RUN_AS_NODE
    [FuseV1Options.EnableCookieEncryption]: false, // Enables cookie encryption
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: true, // Disables the NODE_OPTIONS environment variable
    [FuseV1Options.EnableNodeCliInspectArguments]: true, // Disables the --inspect and --inspect-brk family of CLI options
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, // Enables validation of the app.asar archive on macOS
    [FuseV1Options.OnlyLoadAppFromAsar]: asar === true, // Enforces that Electron will only load your app from "app.asar" instead of its normal search paths
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false, // Loads V8 Snapshot from `browser_v8_context_snapshot.bin` for the browser process
    [FuseV1Options.GrantFileProtocolExtraPrivileges]: true // Grants the file protocol extra privileges
  });
  
  await mv("./dist/electron.exe", "./dist/" + env["npm_package_name"] + ".exe");
}

async function prune(cwd){
  console.log("Removing dev dependencies...");
  await promisify(exec)("npm prune --production", {
    cwd: join(cwd, "resources/app"),
    windowsHide: true
  });
}

async function removeOrphan(cwd){
  console.log("Removing unused arch...");
  const nativeModules = [
    { name: "koffi", path: "/build/koffi", filter: ["win32_ia32"] },
    { name: "regodit", path: "/dist", filter: ["regodit.x86"] },
    { name: "win-screen-resolution", path: "/prebuilds", filter: ["win32-ia32"] }
  ];

  for (const module of nativeModules)
  {
    const path = join(cwd, "resources/app/node_modules", module.name, module.path);
    
    console.log("\t>>>", module.name);
    const list = await ls(path, {
      recursive: true,
      normalize: true,
      ignore: { dir: true }
    });

    const files = (await Promise.all([
      ls(path, {
        recursive: true,
        normalize: true,
        ignore: { dir: true },
        filter: ["LICENSE", "LICENSE.txt"],
        whitelist: true
      }),
      ls(path, {
        recursive: true,
        normalize: true,
        ignore: { dir: true },
        ext: ["node", "dll"],
        filter: module.filter,
        whitelist: true
      })
    ])).flat();
    
    let counter = 0;
    for (const file of list){
      if(!files.includes(file)){
        await rm(join(path, file));
        counter += 1;
      }
    }
    console.log(`\t\tRemoved ${counter} files`);
  }
}

async function debloat(cwd){
  console.log("Debloating native-addons...");
  const nativeModules = [
    { name: "koffi", filter: ["doc", "vendor"] },
    { name: "regodit" },
    { name: "win-screen-resolution", filter: ["bin"] }
  ];
  for (const module of nativeModules)
  {
    const path = join(cwd, "resources/app/node_modules", module.name);
  
    console.log("\t>>>", module.name);
    const list = await ls(path, {
      recursive: true,
      normalize: true,
      ignore: { dir: true }
    });
    
    const files = (await Promise.all([
      ls(path, {
        recursive: true,
        normalize: true,
        ignore: { dir: true },
        filter: ["LICENSE", "LICENSE.txt"],
        whitelist: true
      }),
      ls(path, {
        recursive: true,
        normalize: true,
        ignore: { dir: true },
        ext: ["js", "cjs", "mjs", "node", "dll", "json", "md", "ts"],
        filter: module.filter
      })
    ])).flat();
    
    let counter = 0;
    for (const file of list){
      if(!files.includes(file)){
        await rm(join(path, file));
        counter += 1;
      }
    }
    console.log(`\t\tRemoved ${counter} files`);
  }
}

async function build(){
  const { values : args } = parseArgs({
    options: {
      asar: {
        type: "boolean",
        default: false
      }
    },
    strict: true 
  });

  const cwd = join("./dist");
  await rm(cwd);
  await mkdir(cwd);
  console.log("cwd:", resolve(cwd));
  
  await copy(cwd);
  await mkElectron(cwd, args.asar);
  //cleaning
  await prune(cwd);
  await removeOrphan(cwd);
  await debloat(cwd);
  
  //check arch
  const files = [
    join(cwd, env["npm_package_name"] + ".exe"),
    join(cwd, "resources/app/node_modules/koffi/build/koffi/win32_ia32/koffi.node"),
    join(cwd, "resources/app/node_modules/regodit/dist/regodit.x86.dll"),
    join(cwd, "resources/app/node_modules/win-screen-resolution/prebuilds/win32-ia32/video.napi.node")
  ];
  for (const file of files){
    const [ is64 ] = await attemptify(is64bit)(file);
    if(is64) console.warn("\x1b[1m\x1b[31m" + basename(file), "is x64! (should x86)" + "\x1b[0m");
  }
  
  //asar
  if(args.asar === true){
    console.log("Packing into an asar file...");
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