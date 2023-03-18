import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { mkdir, ls, copyFile, deleteFile, rm } from "@xan105/fs";


console.log("Creating temporary working dir...");
const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const cwd = join(tmpdir(), `${Date.now()}${rng(0, 1000)}`);
await mkdir(cwd);
console.log("cwd:", cwd);

console.log("Copying distributable electron...");
const files = await ls("./node_modules/electron/dist", {
  recursive: true,
  normalize: true,
  ignore: { dir: true },
  filter: ["version"]
});
for (const file of files){
  await copyFile(
    join("./node_modules/electron/dist", file), 
    join(cwd, file)
  );
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
    join(cwd, "_resources/electron", file)
  );
}

console.log("Dependencies... (node_modules)");
const meta = ["package.json", "package-lock.json"];
for (const file of meta){
  await copyFile("./" + file, join(cwd, "_resources", file));
}

let output = await promisify(exec)("npm ci", {
  cwd: join(cwd, "_resources"),
  windowsHide: true
});
console.log(output);

console.log("Pruning node_modules for production...");
output = await promisify(exec)("npm prune --production", {
  cwd: join(cwd, "_resources"),
  windowsHide: true
});
console.log(output);


console.log("Packing into an .asar file...");

const src = join(cwd, "_resources");
const dest = join(cwd, "resources/app.asar");
output = await promisify(exec)(`npx asar pack "${src}" "${dest}" --unpack {*.node,*.dll}`, {
  windowsHide: true
});
console.log(output);

console.log("Cleaning up...")
await rm(join(cwd, "_resources"));




//asar ?
//console.log("Copying license...");
//rcedit
//enigma self contain package


